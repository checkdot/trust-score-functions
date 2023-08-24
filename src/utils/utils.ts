const calculateActivityScore = (followerCounts: any, sensitivity = 20) => {
    if (followerCounts.length == 0 || followerCounts.length == 1) {
        return 50;
    }
    // Calculer les différences entre les jours consécutifs
    let totalDifference = followerCounts.reduce((acc: any, c: any, i: any, array: any) => {
        return acc + (i != 0 ? /* Difference */(c - array[i - 1]) : 0);
    }, 0);
    // Calculer la moyenne des différences
    const averageDifference = totalDifference / (followerCounts.length - 1);
    // Normaliser la moyenne des différences dans la plage -100 à 100
    const normalizedDifference = ((averageDifference * sensitivity) / Math.max(...followerCounts)) * 100;
    // Calculer le score d'activité en combinant la tendance
    let activityScore = (normalizedDifference + 100) / 2;
    // Assurer que le score reste dans la plage de 0 à 100
    const finalScore = Math.max(0, Math.min(100, activityScore));
    // Arrondir le score à deux décimales
    const roundedScore = Math.round(finalScore * 100) / 100;
    return roundedScore;
};

export {
    calculateActivityScore,
}