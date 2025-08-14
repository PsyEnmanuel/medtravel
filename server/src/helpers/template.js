import ejs from "ejs";
import path from "path";
import { _date, _upload, _utility } from "./index.js";

export const getBody = async ({ table, data, account, file = "body" }) => {
  try {
    return await ejs.renderFile(
      path.join(path.resolve(), `views/template/pdf/${table}/${file}.ejs`),
      {
        data,
        account,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export function generateConciliation({ item, items }) {
  try {
    const header = [
      { text: "FECHA", style: "th", noWrap: true },
      { text: "PROVEEDOR", style: "th", noWrap: true },
      { text: "PRESTADOR DE\nSERVICIOS", style: "th", alignment: "center" },
      { text: "CONCEPTO", style: "th" },
      { text: "MONTO\nFACTURADO", style: "thR", alignment: "right" },
      { text: "DESCUENTO DE\nAJUSTE", style: "thR", alignment: "right" },
      { text: "MONTO A\nPROCESAR", style: "thR", alignment: "right" },
      { text: "DEDUCIBLE", style: "thR" },
      { text: "COPAGO", style: "thR" },
      { text: "CUBIERTO", style: "thR" },
      { text: "PAGO\nASEGURADORA", style: "thR", alignment: "right" },
      { text: "RESP.\nASEGURADORA", style: "thR", alignment: "right" },
      { text: "AUTORIZACIÓN", style: "th" },
      { text: "NOTA", style: "th" }
    ];

    const body = [header];

    items.forEach(r => {
      body.push([
        { text: _date.intlDate(r.book_date), alignment: "center", noWrap: true },
        r.provider_description,
        r.doctor_description,
        r.item_description,
        { text: _utility.currency(r.billed_amount), style: "num" },
        { text: _utility.currency(r.discount), style: "num" },
        { text: _utility.currency(r.coverage), style: "num" },
        { text: _utility.currency(r.deducible), style: "num" },
        { text: _utility.currency(r.copago), style: "num" },
        { text: _utility.currency(r.covered), style: "num" },
        { text: _utility.currency(r.insurance_payment), style: "num" },
        { text: _utility.currency(r.insurance_responsability), style: "num" },
        r.insurance_claim || "",
        r.note || ""
      ]);
    });

    const docDefinition = {
      pageSize: "LETTER",
      pageOrientation: "landscape",
      // márgenes más estrechos
      pageMargins: [12, 18, 12, 18],
      defaultStyle: { fontSize: 7, lineHeight: 1.15 },
      content: [
        item.insured_description
          ? { text: item.insured_description, bold: true, fontSize: 9, margin: [0, 0, 0, 6] }
          : {},
        {
          table: {
            headerRows: 1,
            // valores más bajos para que todo quepa
            widths: [32, 60, 60, "*", 46, 50, 50, 40, 40, 44, 60, 60, 50, 55],
            body
          },
          layout: {
            fillColor: (rowIndex) =>
              rowIndex === 0 ? "#0d2f57" : rowIndex % 2 ? "#f5f8fb" : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#c8d4e0",
            vLineColor: () => "#c8d4e0",
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 2,
            paddingBottom: () => 2
          },
          dontBreakRows: true,
          keepWithHeaderRows: 1
        }
      ],
      styles: {
        th: { color: "white", bold: true },
        thR: { color: "white", bold: true, alignment: "right" },
        num: { alignment: "right" }
      }
    };

    const logoB64 = _upload.convertImagetoBase64("logoText.png");

    const dd = {
      pageSize: 'LETTER',
      pageOrientation: "landscape",
      pageMargins: [0, 90, 0, 60],
      header: (currentPage, pageCount, pageSize) => {
        return {
          stack: [
            // Fondo gris
            {
              canvas: [
                { type: 'rect', x: 0, y: 0, w: pageSize.width, h: 40, color: '#f2f2f2' }
              ]
            },
            // Contenido del header
            {
              margin: [40, -35, 40, 0],
              columns: [
                {
                  image: 'logoBupa', // tu logo base64
                  width: 60,
                  alignment: 'center',
                  margin: [0, -5, 0, 0] // para centrar verticalmente
                },
                {
                  text: 'Explicación de Beneficios',
                  style: 'headerTitle',
                  alignment: 'center',
                  margin: [0, 10, 0, 0]
                },
                {
                  stack: [
                    { text: '07-07-2025', fontSize: 9 },
                    { text: `Página ${currentPage} de ${pageCount}`, fontSize: 9 }
                  ],
                  width: 80,
                  margin: [0, 5, 0, 0] // centra verticalmente el bloque derecho
                }
              ]
            }
          ]
        };
      },
      footer: (currentPage) => {
        if (currentPage === 1) {
          return {
            margin: [40, 0, 40, 20],
            stack: [
              { text: 'ESTE DOCUMENTO NO ES UNA FACTURA.', style: 'footerNote', alignment: 'center' },
              { text: 'Este documento es una explicación de los beneficios pagaderos bajo su seguro de salud.', style: 'footerText', alignment: 'center' }
            ]
          };
        }
        return null;
      },
      content: [
        {
          margin: [40, 0, 40, 0],
          columns: [
            {
              width: '60%',
              stack: [
                { text: 'Asegurado Principal', style: 'sectionTitle' },
                { text: item.insured_description, style: 'text' },
                { text: 'DOMICILIO REGISTRADO', style: 'text' },
                { text: 'SANTO DOMINGO, DOMINICAN REPUBLIC', style: 'text', margin: [0, 0, 0, 10] },

                { text: 'Número de Póliza', style: 'sectionTitle' },
                { text: item.policy_number, style: 'text', margin: [0, 0, 0, 10] },

                { text: 'Producto', style: 'sectionTitle' },
                { text: 'NOMBRE DEL PLAN', style: 'text', margin: [0, 0, 0, 10] },

                { text: 'Agente', style: 'sectionTitle' },
                { text: 'MATOS CORREDORES DE SEGUROS, SRL', style: 'text' }
              ]
            },
            {
              width: '40%',
              stack: [
                { text: 'Servicio al Cliente', style: 'sectionTitle' },
                { text: 'Para cualquier pregunta puede contactarnos a través de', style: 'text' },
                { text: 'https://www.momatos.com/contactanos y enviarnos una consulta.', style: 'text' },
                { text: 'También puede contactarnos en nuestra línea de Servicio al Cliente al:', style: 'text' },
                { text: '(809) 620-0000', style: 'phone' },
                { text: 'o consulte su número local en nuestra página web:', style: 'text' },
                { text: 'https://www.momatos.com/contactanos', style: 'text' }
              ]
            }
          ]
        },
        {
          style: { fontSize: 7, lineHeight: 1.15 },
          table: {
            headerRows: 1,
            // valores más bajos para que todo quepa
            widths: [32, 60, 60, "*", 46, 50, 50, 40, 40, 44, 60, 60, 50, 55],
            body
          },
          layout: {
            fillColor: (rowIndex) =>
              rowIndex === 0 ? "#EAEAEA" : rowIndex % 2 ? "#f5f8fb" : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#c8d4e0",
            vLineColor: () => "#c8d4e0",
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 2,
            paddingBottom: () => 2
          },
          dontBreakRows: true,
          keepWithHeaderRows: 1,
          pageBreak: 'before'
        }
      ],
      styles: {
        headerTitle: { fontSize: 14, bold: true },
        sectionTitle: { fontSize: 9, bold: true, margin: [0, 5, 0, 1] },
        text: { fontSize: 9 },
        phone: { fontSize: 10, bold: true },
        footerNote: { fontSize: 9, bold: true },
        footerText: { fontSize: 8 },
        th: { color: "black", bold: true, lineHeight: 0.7 },
        thR: { color: "black", bold: true, alignment: "right", lineHeight: 0.7 },
        num: { alignment: "right" }
      },
      images: {
        logoBupa: logoB64 // aquí usamos tu función para obtener base64
      }
    };



    return { docDefinition: dd };
  } catch (error) {
    console.log(error);
  }
}


