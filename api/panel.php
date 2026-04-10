<?php
// api/panel.php

/**
 * Core logic to determine applicant scoring progress.
 */
function get_progress(PDO $pdo, int $applicant_id): array {
    // Get count of active tutors currently in the system
    $activeTutors = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='tutor' AND is_active=1")->fetchColumn();

    // Get count of distinct scores submitted for this applicant by active tutors
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT s.tutor_id) 
        FROM scores s
        JOIN users u ON u.id = s.tutor_id
        WHERE s.applicant_id = ? AND u.role='tutor' AND u.is_active=1
    ");
    $stmt->execute([$applicant_id]);
    $scored = (int)$stmt->fetchColumn();

    return [
        'scored' => $scored,
        'active' => $activeTutors,
        'is_zero' => ($activeTutors === 0)
    ];
}

/**
 * Recalculate and persist completion based on system settings.
 */
function recalc_applicant_completion(PDO $pdo, int $applicant_id): void {
    $settings = $pdo->query("SELECT completion_mode, minimum_required_tutors FROM settings WHERE id=1")->fetch();
    if (!$settings) return;

    $prog = get_progress($pdo, $applicant_id);
    $mode = $settings['completion_mode'] ?? 'ALL_ACTIVE_TUTORS';
    $min  = (int)($settings['minimum_required_tutors'] ?? 0);

    $isComplete = false;
    if ($mode === 'MINIMUM_REQUIRED' && $min > 0) {
        $isComplete = ($prog['scored'] >= $min);
    } else {
        $isComplete = (!$prog['is_zero'] && $prog['scored'] >= $prog['active']);
    }

    if ($isComplete) {
        $stmt = $pdo->prepare("
            UPDATE applicants 
            SET panel_status='COMPLETED', 
                is_frozen=1, 
                completed_at = COALESCE(completed_at, NOW()) 
            WHERE id=?
        ");
        $stmt->execute([$applicant_id]);
    }
}
