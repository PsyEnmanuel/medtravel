export const useInputNumber = () => {

    function substractInputNumber(item, key, intervals = 1) {
        if (parseInt(item[key]) > intervals) {
            item[key] = parseInt(item[key]) - intervals
        }
    }

    function addInputNumber(item, key, intervals = 1) {
        if (item[key]) {
            item[key] = parseInt(item[key]) + intervals
            return;
        }
        item[key] = intervals
    }

    return {
        substractInputNumber,
        addInputNumber
    }
}