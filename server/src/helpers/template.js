import ejs from "ejs";
import path from "path";
import { _utility } from "./index.js";

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

export function generateConciliation({ item, items, payments, files, account, user }) {
  try {

    const header = [
      { text: "FECHA", style: "th", noWrap: true },
      { text: "PROVEEDOR", style: "th", noWrap: true },
      { text: "PRESTADOR DE SERVICIOS", style: "th", noWrap: true },
      { text: "CONCEPTO", style: "th" },
      { text: "MONTO FACTURADO", style: "thR" },
      { text: "DESCUENTO DE AJUSTE", style: "thR" },
      { text: "MONTO A PROCESAR", style: "thR" },
      { text: "DEDUCIBLE", style: "thR" },
      { text: "COPAGO", style: "thR" },
      { text: "CUBIERTO", style: "thR" },
      { text: "PAGO ASEGURADORA", style: "thR" },
      { text: "RESP. ASEGURADORA", style: "thR" },
      { text: "AUTORIZACIÓN", style: "th", noWrap: true },
      { text: "NOTA", style: "th" }
    ];

    const body = [header];

    rows.forEach(r => {
      body.push([
        { text: r.fecha, alignment: "center", noWrap: true },
        r.proveedor,
        r.prestador,
        r.concepto,
        _utility.currency(r.monto_facturado),
        _utility.currency(r.descuento_ajuste),
        _utility.currency(r.monto_procesar),
        _utility.currency(r.deducible),
        _utility.currency(r.copago),
        _utility.currency(r.cubierto),
        _utility.currency(r.pago_aseguradora),
        _utility.currency(r.resp_aseguradora),
        r.autorizacion,
        r.nota
      ]);
    });

    return {
      pageSize: "LETTER",
      pageOrientation: "landscape",
      pageMargins: [18, 18, 18, 18],
      defaultStyle: { fontSize: 8 },
      content: [
        patientName
          ? { text: patientName, bold: true, fontSize: 10, margin: [0, 0, 0, 6] }
          : {},
        {
          table: {
            headerRows: 1,
            // tune widths if you need more/less room per column
            widths: [
              42, 90, 105, "*", 60, 68, 68, 55, 50, 55, 82, 82, 72, 80
            ],
            body
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#0d2f57" : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#c8d4e0",
            vLineColor: () => "#c8d4e0",
            paddingLeft: () => 3,
            paddingRight: () => 3,
            paddingTop: () => 4,
            paddingBottom: () => 4
          }
        }
      ],
      styles: {
        th: { color: "white", bold: true },
        thR: { color: "white", bold: true, alignment: "right" }
      }
    };


  } catch (error) {
    console.log(error);
  }
}