export const maskaNumberToken = '0:\\d:multiple';
export const maskaNumber = '#0';
export const maskaDecimalToken = '0:\\d:multiple|9:\\d:optional';
export const maskaDecimal = '0.99';
export const maskaMoney = '0:\\d:multiple|9:\\d:optional';
export const maskaTimeToken = '0:[0-9]:optional|9:[0-9]'
export const maskaTime = '#0:99'

export const optionsMoney = {
    preProcess: val => val.replace(/[$,]/g, ''),
    postProcess: val => {
        if (!val) return ''

        const sub = 3 - (val.includes('.') ? val.length - val.indexOf('.') : 0)

        return Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(val)
            .slice(0, sub ? -sub : undefined)
    }
}