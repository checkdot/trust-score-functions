const getTechnicalAuditScore = (project: any) => {
    let auditScore = 0;
    let reportScore = 30; // if no report the report score is always set at 30.
    if (project.audit != undefined) {
        auditScore = 100;
    }
    let totalScore = 0;
    if (project.report != undefined && project.report.status != 'KO') {
        // Si le projet.report.status est défini, c'est-à-dire que l'audit a réussi
        const highSeverityScore = (100 / (Number(project.report.high) + 1)) * 50 / 100;
        const mediumSeverityScore = (100 / (Number(project.report.medium) + 1)) * 30 / 100;
        const lowSeverityScore = (100 / (Number(project.report.low) + 1)) * 20 / 100;
        // Calcul du score total du rapport
        reportScore = highSeverityScore + mediumSeverityScore + lowSeverityScore;
        totalScore = (auditScore != 0 ? (auditScore / 2) + (reportScore / 2) : reportScore);
    } else {
        totalScore = auditScore;
    }
    return totalScore;
};

export {
    getTechnicalAuditScore
}