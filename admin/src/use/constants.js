import { inject } from "vue";

export const useConstants = () => {
    const $tl = inject('$tl');

    const CONFIG_FILTER_LOCAL = 'filter'
    const CONFIG_FORM_LOCAL = 'form'

    const EVENT_STATE = {
        SCHEDULED: { value: "SCHEDULED", label: $tl("scheduled"), color: '#4CADE6' },
        PENDING: { value: "PENDING", label: $tl("pending"), color: '#D3A612' },
        IN_APPOINTMENT: { value: "IN_APPOINTMENT", label: $tl("in_appointment"), color: '#AF69EE' },
        CONCLUDED: { value: "CONCLUDED", label: $tl("concluded"), color: '#CFB28C' },
        CANCELLED: { value: "CANCELLED", label: $tl("cancelled"), color: '#FF6666' },
        NO_SHOW: { value: "NO_SHOW", label: $tl("no_show"), color: '#000000' },
    };

    const CATALOGUE_TYPE = {
        CONSULTATION: { value: "CONSULTATION", label: $tl("consultation"), color: '#D0E8FF' },
        PROCEDURE: { value: "PROCEDURE", label: $tl("procedure"), color: '#FFD6D6' },
    };

    const RECORD_TYPE = {
        MEDICALRECORD: { value: "MEDICAL_RECORD", label: $tl("medical_record"), color: '#D0E8FF' },
        PROCEDURE: { value: "PROCEDURE", label: $tl("procedure"), color: '#FFD6D6' },
    };

    const FILETYPE = {
        GENERAL: { value: "GENERAL", label: $tl("general"), color: '#D0E8FF' },
        PERFIL: { value: "PERFIL", label: $tl("profile"), color: '#FFD6D6' },
    };

    const CURRENCY = {
        USD: { value: "USD", label: "USD", color: '#D0E8FF' },
        DOP: { value: "DOP", label: "DOP", color: '#FFD6D6' },
    };

    const SEX = {
        MALE: { value: "MALE", label: $tl("male"), color: '#D0E8FF' },
        FEMALE: { value: "FEMALE", label: $tl("female"), color: '#FFD6D6' },
    };

    const CIVIL_STATUS = {
        SINGLE: { value: "SINGLE", label: $tl("single"), color: '#D0E8FF' },
        MARRIED: { value: "MARRIED", label: $tl("married"), color: '#FFD6D6' },
        DIVORCED: { value: "DIVORCED", label: $tl("divorced"), color: '#FFD6D6' },
        WIDOWED: { value: "WIDOWED", label: $tl("widowed"), color: '#FFD6D6' },
        CIVIL_UNION: { value: "CIVIL_UNION", label: $tl("civil_union"), color: '#FFD6D6' },
    };

    const IDENT_TYPE = {
        CEDULA: { value: "CEDULA", label: $tl("id"), color: '#D0E8FF' },
        PASAPORTE: { value: "PASAPORTE", label: $tl("passport"), color: '#FFD6D6' },
        WITHOUT_IDENTIFICATION: { value: "WITHOUT_IDENTIFICATION", label: $tl("without_identification"), color: '#D6F5D6' },
    };

    const INVOICE_TYPE = {
        INVOICE: { value: "INVOICE", label: $tl("invoice"), color: '#D0E8FF' },
        PAYMENT: { value: "PAYMENT", label: $tl("payment"), color: '#FFD6D6' },
        EXPENSE: { value: "EXPENSE", label: $tl("expense"), color: '#D6F5D6' },
        PURCHASEORDER: { value: "PURCHASEORDER", label: $tl("purchaseorder"), color: '#FFF9CC' },
        INVENTORY: { value: "INVENTORY", label: $tl("inventory"), color: '#E8E4FC' },
    };

    const INVOICE_STATE = {
        PENDING: { value: "PENDING", label: $tl("PENDING"), color: '#D0E8FF' },
        PAID: { value: "PAID", label: $tl("PAID"), color: '#FFD6D6' },
    };

    const PAYMENT_TYPE = {
        CASH: { value: "CASH", label: $tl("CASH"), color: '#D0E8FF' },
        TRANSFER: { value: "TRANSFER", label: $tl("TRANSFER"), color: '#FFD6D6' },
        CARD: { value: "CARD", label: $tl("CARD"), color: '#FFD6D6' },
    };

    const NCF_DESCRIPTION = {
        FACTURA_CREDITO_FISCAL: {
            value: "FACTURA_CREDITO_FISCAL",
            label: $tl("tax_credit_invoice")
        },
        FACTURA_CONSUMO: {
            value: "FACTURA_CONSUMO",
            label: $tl("consumption_invoice")
        },
        // NOTA_DEBITO: {
        //     value: "NOTA_DEBITO",
        //     label: $tl("Nota de débito")
        // },
        // NOTA_CREDITO: {
        //     value: "NOTA_CREDITO",
        //     label: $tl("Nota de crédito")
        // },
        // COMPROBANTE_COMPRAS: {
        //     value: "COMPROBANTE_COMPRAS",
        //     label: $tl("Compras a informales")
        // },
        // REGISTRO_UNICO_INGRESOS: {
        //     value: "REGISTRO_UNICO_INGRESOS",
        //     label: $tl("Registro único de ingresos")
        // },
        // GASTOS_MENORES: {
        //     value: "GASTOS_MENORES",
        //     label: $tl("Gastos menores")
        // },
        // REGIMEN_ESPECIALES: {
        //     value: "REGIMEN_ESPECIALES",
        //     label: $tl("Régimen especial")
        // },
        // GUBERNAMENTAL: {
        //     value: "GUBERNAMENTAL",
        //     label: $tl("Gubernamental")
        // },
        // EXPORTACION: {
        //     value: "EXPORTACION",
        //     label: $tl("Exportación")
        // },
        // PAGOS_EXTERIOR: {
        //     value: "PAGOS_EXTERIOR",
        //     label: $tl("Pagos al exterior")
        // }
    };

    const NCF_PREFIX = {
        B01: { value: "B01", label: "FACTURA_CREDITO_FISCAL" },
        B02: { value: "B02", label: "FACTURA_CONSUMO" },
        // B03: { value: "B03", label: "NOTA_DEBITO" },
        // B04: { value: "B04", label: "NOTA_CREDITO" },
        // B11: { value: "B11", label: "COMPROBANTE_COMPRAS" },
        // B12: { value: "B12", label: "REGISTRO_UNICO_INGRESOS" },
        // B13: { value: "B13", label: "GASTOS_MENORES" },
        // B14: { value: "B14", label: "REGIMEN_ESPECIALES" },
        // B15: { value: "B15", label: "GUBERNAMENTAL" },
        // B16: { value: "B16", label: "EXPORTACION" },
        // B17: { value: "B17", label: "PAGOS_EXTERIOR" },
        // E31: { value: "E31", label: "FACTURA_CREDITO_FISCAL" },
        // E32: { value: "E32", label: "FACTURA_CONSUMO" },
        // E33: { value: "E33", label: "NOTA_DEBITO" },
        // E34: { value: "E34", label: "NOTA_CREDITO" },
        // E41: { value: "E41", label: "COMPROBANTE_COMPRAS" },
        // E43: { value: "E43", label: "GASTOS_MENORES" },
        // E44: { value: "E44", label: "REGIMEN_ESPECIALES" },
        // E45: { value: "E45", label: "GUBERNAMENTAL" },
        // E46: { value: "E46", label: "EXPORTACION" },
        // E47: { value: "E47", label: "PAGOS_EXTERIOR" }
    };

    return {
        NCF_DESCRIPTION,
        NCF_PREFIX,
        CONFIG_FILTER_LOCAL,
        CONFIG_FORM_LOCAL,
        EVENT_STATE,
        CATALOGUE_TYPE,
        RECORD_TYPE,
        FILETYPE,
        CURRENCY,
        INVOICE_TYPE,
        INVOICE_STATE,
        SEX,
        CIVIL_STATUS,
        IDENT_TYPE,
        PAYMENT_TYPE
    };
};
