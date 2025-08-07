export function setAgeStats(stats, age) {
    switch (true) {
        case age > 0 && age <= 10:
            if (stats.ageRange["0/10"]) {
                stats.ageRange["0/10"].push(age);
            } else {
                stats.ageRange["0/10"] = [age]
            }
            break;
        case age > 10 && age <= 20:
            if (stats.ageRange["10/20"]) {
                stats.ageRange["10/20"].push(age);
            } else {
                stats.ageRange["10/20"] = [age]
            }
            break;
        case age > 20 && age <= 30:
            if (stats.ageRange["20/20"]) {
                stats.ageRange["20/30"].push(age);
            } else {
                stats.ageRange["20/30"] = [age]
            }
            break;
        case age > 30 && age <= 40:
            if (stats.ageRange["30/40"]) {
                stats.ageRange["30/40"].push(age);
            } else {
                stats.ageRange["30/40"] = [age]
            }
            break;
        case age > 40 && age <= 50:
            if (stats.ageRange["40/50"]) {
                stats.ageRange["40/50"].push(age);
            } else {
                stats.ageRange["40/50"] = [age]
            }
            break;
        case age > 50 && age <= 70:
            if (stats.ageRange["50/70"]) {
                stats.ageRange["50/70"].push(age);
            } else {
                stats.ageRange["50/70"] = [age]
            }
            break;
        case age > 70:
            if (stats.ageRange["70/+"]) {
                stats.ageRange["70/+"].push(age);
            } else {
                stats.ageRange["70/+"] = [age]
            }
            break;
    }
}