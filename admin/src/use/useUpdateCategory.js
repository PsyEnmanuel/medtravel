import { inject } from "vue";

const files = [
    {
        "id": 340,
        "description": "ANALÍTICAS",
        "parent_id": 24,
        "label": "ANALÍTICAS",
        "value": 340,
        "color": null
    },
    {
        "id": 357,
        "description": "CAPTURA PANTALLA",
        "parent_id": 24,
        "label": "CAPTURA PANTALLA",
        "value": 357,
        "color": null
    },
    {
        "id": 314,
        "description": "CARNÉ",
        "parent_id": 24,
        "label": "CARNÉ",
        "value": 314,
        "color": null
    },
    {
        "id": 315,
        "description": "CÉDULA",
        "parent_id": 24,
        "label": "CÉDULA",
        "value": 315,
        "color": null
    },
    {
        "id": 311,
        "description": "CEDULA Y SEGURO",
        "parent_id": 24,
        "label": "CEDULA Y SEGURO",
        "value": 311,
        "color": null
    },
    {
        "id": 393,
        "description": "COMPROBANTE DE PAGO",
        "parent_id": 24,
        "label": "COMPROBANTE DE PAGO",
        "value": 393,
        "color": null
    },
    {
        "id": 395,
        "description": "CONFIRMACION PROVEEDOR AFILIADO A RED",
        "parent_id": 24,
        "label": "CONFIRMACION PROVEEDOR AFILIADO A RED",
        "value": 395,
        "color": null
    },
    {
        "id": 318,
        "description": "CORREO ELECTRÓNICO",
        "parent_id": 24,
        "label": "CORREO ELECTRÓNICO",
        "value": 318,
        "color": null
    },
    {
        "id": 400,
        "description": "CUADRO DE BENEFICIOS",
        "parent_id": 24,
        "label": "CUADRO DE BENEFICIOS",
        "value": 400,
        "color": null
    },
    {
        "id": 199,
        "description": "DOCUMENTO IDENTIFICACIÓN",
        "parent_id": 24,
        "label": "DOCUMENTO IDENTIFICACIÓN",
        "value": 199,
        "color": null
    },
    {
        "id": 313,
        "description": "EOB",
        "parent_id": 24,
        "label": "EOB",
        "value": 313,
        "color": null
    },
    {
        "id": 312,
        "description": "EOB - UCH",
        "parent_id": 24,
        "label": "EOB - UCH",
        "value": 312,
        "color": null
    },
    {
        "id": 392,
        "description": "ESTADO DE CUENTA",
        "parent_id": 24,
        "label": "ESTADO DE CUENTA",
        "value": 392,
        "color": null
    },
    {
        "id": 367,
        "description": "ESTUDIO DE IMÁGENES",
        "parent_id": 24,
        "label": "ESTUDIO DE IMÁGENES",
        "value": 367,
        "color": null
    },
    {
        "id": 382,
        "description": "FORMULARIO DE REGISTO DE PACIENTE (INTAKE FORM)",
        "parent_id": 24,
        "label": "FORMULARIO DE REGISTO DE PACIENTE (INTAKE FORM)",
        "value": 382,
        "color": null
    },
    {
        "id": 188,
        "description": "FOTO PERFIL",
        "parent_id": 24,
        "label": "FOTO PERFIL",
        "value": 188,
        "color": null
    },
    {
        "id": 187,
        "description": "GENERAL",
        "parent_id": 24,
        "label": "GENERAL",
        "value": 187,
        "color": null
    },
    {
        "id": 198,
        "description": "GUÍA MÉDICA",
        "parent_id": 24,
        "label": "GUÍA MÉDICA",
        "value": 198,
        "color": null
    },
    {
        "id": 274,
        "description": "HIPAA",
        "parent_id": 24,
        "label": "HIPAA",
        "value": 274,
        "color": null
    },
    {
        "id": 397,
        "description": "INDICACION MEDICA",
        "parent_id": 24,
        "label": "INDICACION MEDICA",
        "value": 397,
        "color": null
    },
    {
        "id": 304,
        "description": "ITINERARIO",
        "parent_id": 24,
        "label": "ITINERARIO",
        "value": 304,
        "color": null
    },
    {
        "id": 356,
        "description": "LABORATORIOS PPS",
        "parent_id": 24,
        "label": "LABORATORIOS PPS",
        "value": 356,
        "color": null
    },
    {
        "id": 396,
        "description": "LISTADO DE CONSUMOS",
        "parent_id": 24,
        "label": "LISTADO DE CONSUMOS",
        "value": 396,
        "color": null
    },
    {
        "id": 380,
        "description": "MAPA",
        "parent_id": 24,
        "label": "MAPA",
        "value": 380,
        "color": null
    },
    {
        "id": 276,
        "description": "NOTAS MÉDICAS",
        "parent_id": 24,
        "label": "NOTAS MÉDICAS",
        "value": 276,
        "color": null
    },
    {
        "id": 371,
        "description": "ORDENES MEDICAS",
        "parent_id": 24,
        "label": "ORDENES MEDICAS",
        "value": 371,
        "color": null
    },
    {
        "id": 316,
        "description": "PASAPORTE",
        "parent_id": 24,
        "label": "PASAPORTE",
        "value": 316,
        "color": null
    },
    {
        "id": 381,
        "description": "PRECERTIFICACIÓN",
        "parent_id": 24,
        "label": "PRECERTIFICACIÓN",
        "value": 381,
        "color": null
    },
    {
        "id": 321,
        "description": "PRESUPUESTO",
        "parent_id": 24,
        "label": "PRESUPUESTO",
        "value": 321,
        "color": null
    },
    {
        "id": 369,
        "description": "RESULTADOS PATOLOGÍA CONFIRMANDO CA HIGADO",
        "parent_id": 24,
        "label": "RESULTADOS PATOLOGÍA CONFIRMANDO CA HIGADO",
        "value": 369,
        "color": null
    },
    {
        "id": 275,
        "description": "ROI",
        "parent_id": 24,
        "label": "ROI",
        "value": 275,
        "color": null
    },
    {
        "id": 317,
        "description": "VISA",
        "parent_id": 24,
        "label": "VISA",
        "value": 317,
        "color": null
    },
    {
        "id": 197,
        "description": "VOB",
        "parent_id": 24,
        "label": "VOB",
        "value": 197,
        "color": null
    }
]

const prefix = 'FILE_'

export const normalizeRef = (label) => {
    return label.toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') 
                .replace(/\s+/g, '_')
                .replace(/[^\w]/g, '')
}

const useUpdateCategory = () => {
  const $api = inject("$api");
  const filesWithRef = files.map((item) => {
      return {
          ...item,
          ref: prefix + normalizeRef(item.label)
      }
  })


  async function update(list) {
  for (const cat of list) {
      await $api.put(`category/${cat.id}`, cat);
  }
  }

  const updateCats = async () => {
    try {
        await update(filesWithRef);
        console.log('✅ Files Category updated successfully');
    } catch (error) {
        console.error('❌ Error updating Files Category:', error);
    }
  }

  return { updateCats }
}

export default useUpdateCategory