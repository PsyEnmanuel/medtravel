import express, { text } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _template, _upload } from "../helpers/index.js";
import { getFiles, getProfilePic } from "../helpers/query.js";
import path from "path";
import fs from "fs";

const imagesBase64Dir = path.join(path.resolve(), "/public/base64/");
const frontPage = fs.readFileSync(`${imagesBase64Dir}/guia1.png`).toString('base64');
const carnet = fs.readFileSync(`${imagesBase64Dir}/guia2.png`).toString('base64');
const content1 = fs.readFileSync(`${imagesBase64Dir}/guia3.png`).toString('base64');
const content2 = fs.readFileSync(`${imagesBase64Dir}/guia4.png`).toString('base64');
const branches = fs.readFileSync(`${imagesBase64Dir}/guia19.png`).toString('base64');

const BACKGROUNDS = [
  frontPage, // page 1
  carnet,    // page 2
  content1,  // page 3
  content2,  // page 4
  content2,  // page 5
  content2,  // page 6
  content1,  // page 7
  content1,  // page 8
  content2,  // page 9
  content1,  // page 10
  content2,  // page 11
  content1,  // page 12
  content2,  // page 13
  content1,  // page 14
  content2,  // page 15
  content2,  // page 16
  content2,  // page 17
  content1,  // page 18
  branches   // page 19
];
const router = express.Router();

router.use(isAuthenticated);

router.get("/medical-guide/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const template = 'medical_guide';

    const item = await _query.getRowById({
      id: req.params.id,
      table: 't_event',
      user,
    });

    const { items: itineraries } = await _query.getRows({
      table: 't_itinerary',
      user,
      query: {
          where: {
              event_id: req.params.id,
              c_status: 4
          }
      }
    });

    const data = item

    data._files = {
      cardnet: [],
      presertification: [],
      provider: null,
      doctor: [],
    }

    if (itineraries.length) {
      data.itineraries = itineraries
      for (let i = 0; i < data.itineraries.length; i++) {
        const itinerary = data.itineraries[i];
        const provider = await _query.getRowById({
          id: itinerary.provider_id,
          table: 't_provider',
          user,
        });
        if (provider) {
          itinerary.provider_address = provider.address
          itinerary.provider_city = provider.city
          itinerary.provider_country = provider.country
        }
        if (itinerary) {
          itinerary.attendance_day = _date.intlDay(itinerary.attendance_datetime);
          itinerary.attendance_date = _date.intlDate(itinerary.attendance_datetime);
          itinerary.attendance_time = _date.intlTimeClean(itinerary.attendance_datetime);
          itinerary.attendance_time_format = _date.extractAMPM(itinerary.attendance_time);
        }
        const doctor = await _query.getRowById({
          id: itinerary.doctor_id,
          table: 't_doctor',
          user,
        });

        if (doctor) {
          itinerary.doctor_address = doctor.speciality
          if (doctor.speciality) {
              doctor.speciality = JSON.parse(doctor.speciality)
          } else {
              doctor.speciality = []
          }
          const [doctor_profile] = await getFiles({ ref_key: 't_doctor', ref_id: doctor.id });
          if (doctor_profile) {
              data._files.doctor.push({ ...doctor, profile: doctor_profile.url })
          }
        }
      }
    }
    
    data.provider = await _query.getRowById({
      id: data.provider_id,
      table: 't_provider',
      user,
    });

    let provider_files;
    if (data.provider) {
      data.provider.place = `${data.provider.description}, ${data.provider.country}, ${data.provider.city}`
      provider_files = await getFiles({ ref_key: 't_provider', ref_id: data.provider.id });

      if (provider_files?.length) {
          const [provider_file] = provider_files.filter(i => i.$file_type_id === 198)
          const [provider_mapa] = provider_files.filter(i => i.$file_type_id === 380)
          data.provider.file = provider_file?.url
          data.provider.mapa = provider_mapa?.url
      }
      data._files.provider = await getProfilePic({ ref_key: 't_provider', ref_id: item.provider_id });
    }

    const files = await getFiles({ ref_key: 't_event', ref_id: req.params.id });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.$file_type_id === 314) {
          data._files.cardnet.push(file.url)
      }
      if (file.$file_type_id === 381) {
          if (file.icon === 'pdf') {
              const url = _upload.getFilePathFromUrl(file.url)
              const allFiles = await _upload.pdfToImg2(url);
              for (let j = 0; j < allFiles.length; j++) {
                  const presertification_file = _upload.publicPath({ account, table: 't_event', filename: allFiles[j] });
                  data._files.presertification.push(presertification_file)
              }
          } else {
              data._files.presertification.push(file.url)
          }
      }
    }

    data.images = {
      frontPage: _upload.convertImagetoBase64("frontPage.png"),
      content1: _upload.convertImagetoBase64("content1.png"),
      guia3: _upload.convertImagetoBase64("guia3.png"),
      guia4: _upload.convertImagetoBase64("guia4.png"),
      guia19: _upload.convertImagetoBase64("guia19.png"),
    };

    const bodyTemplate = await _template.getBody({
      table: template,
      account,
      data,
    });

    const filename = await _upload.generatePDF({
      account,
      data,
      table: 't_event',
      filename: data.code,
      bodyTemplate,
      header: false,
      footer: false,
      margin: {
          top: "0",
          bottom: "0",
          right: "0",
          left: "0",
      },
    });
    console.log(filename);

    return res.status(200).json({ item, filename });
  } catch (error) {
      next(error);
  }
});

router.get("/medical-guide2/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    const item = await _query.getRowById({
      id: req.params.id,
      table: "t_event",
      user,
    });
    const filename = item.code || "medical-guide";

    const { items: itineraries } = await _query.getRows({
      table: "t_itinerary",
      user,
      query: {
        where: {
          event_id: req.params.id,
          c_status: 4,
        },
      },
    });

    if (itineraries.length) {
      for (let itinerary of itineraries) {
        const provider = await _query.getRowById({
          id: itinerary.provider_id,
          table: "t_provider",
          user,
        });
        if (provider) {
          itinerary.provider_address = provider.address;
          itinerary.provider_city = provider.city;
          itinerary.provider_country = provider.country;
        }
        if (itinerary.attendance_datetime) {
          itinerary.attendance_day = _date.intlDay(itinerary.attendance_datetime);
          itinerary.attendance_date = _date.intlDate(itinerary.attendance_datetime);
          itinerary.attendance_time = _date.intlTimeClean(itinerary.attendance_datetime);
          itinerary.attendance_time_format = _date.extractAMPM(itinerary.attendance_time);
        }
        const doctor = await _query.getRowById({
          id: itinerary.doctor_id,
          table: "t_doctor",
          user,
        });
        if (doctor) {
          itinerary.doctor_address = doctor.speciality;
          if (doctor.speciality) {
            doctor.speciality = JSON.parse(doctor.speciality);
          } else {
            doctor.speciality = [];
          }
        }
      }
    }

    const provider = await _query.getRowById({
      id: item.provider_id,
      table: "t_provider",
      user,
    });

    const files = await getFiles({ ref_key: "t_event", ref_id: req.params.id });

    console.log({provider,files})

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 150, 40, 60], 
      background: function (currentPage) {
        const bg = BACKGROUNDS[currentPage - 1];
        if (!bg) return null;

        return {
          image: `data:image/png;base64,${bg}`,
          width: 595,
          height: 842
        };
      },
      content: [
        { text: '', pageBreak: 'after' }, // page1
        { text: 'Carnet', pageBreak: 'after' }, // page2
        { text: 'Logo', pageBreak: 'after' }, // page3
        { text:'CONTENIDO', style: "title", margin: [30,35, 0, 0] }, // page4 start
        {
          type: 'square',
          style: 'item',
          ul: [
            'Pre-certificación',
            'Citas Medicas',
            'Sobre el Doctor',
            'Sobre el Hospital',
            'Sobre la Ciudad',
            'Estadía y Hospital',
            'Atracciones',
            'Otras Informaciones'
          ], 
          margin: [30, 0, 0, 0],
          pageBreak: 'after'
        }, // page4 end
        {
          text: 'PRE-CERTIFICACIÓN',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after'
        }, // page5
        {
          text: 'CITAS MÉDICAS',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 },
          pageBreak: 'after'
        }, // page6
        {
          table: {
            widths: ['30%', '18%', '30%', '27%'],
            body: [
              [
                { text: 'FECHA', style: 'tableHeader', alignment: 'center' },
                { text: 'HORA', style: 'tableHeader', alignment: 'center' },
                { text: 'LUGAR', style: 'tableHeader', alignment: 'center' },
                { text: 'DOCTOR', style: 'tableHeader', alignment: 'center' }
              ],
              [
                { 
                  stack: [
                    { text: 'DÍA,', bold: false, fontSize: 9 },
                    { text: 'FECHA', bold: true, fontSize: 9 }
                  ],
                  style: 'tableSubHeader',
                  alignment: 'left'
                },
                { 
                  stack: [
                    { text: 'HORA', fontSize: 9 },
                    { text: 'TIPO DE SERVICIOS', fontSize: 8 }
                  ],
                  style: 'tableSubHeader',
                  alignment: 'center'
                },
                { 
                  stack: [
                    { text: 'NOMBRE DEL HOSPITAL', bold: true, fontSize: 9, lineHeight: 0.7 },
                    { text: 'DIRECCIÓN', fontSize: 8 }
                  ],
                  style: 'tableSubHeader',
                  alignment: 'center'
                },
                { 
                  stack: [
                    { text: 'NOMBRE DEL DOCTOR', bold: true, fontSize: 9, lineHeight: 0.7 },
                    { text: 'ESPECIALIDAD', fontSize: 8 }
                  ],
                  style: 'tableSubHeader',
                  alignment: 'center'
                }
              ],
              // Empty data row example
              [
                { text: '', minHeight: 80 },
                { text: '', minHeight: 80 },
                { text: '', minHeight: 80 },
                { text: '', minHeight: 80 }
              ]
            ]
          },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? '#1b355e' : null;
            },
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0.5; },
            hLineColor: function () { return '#CCCCCC'; },
            vLineColor: function () { return '#CCCCCC'; }
          }
        },
        { text: '\n' },
        {
          text: 'NOTAS:',
          style: 'notesHeader'
        },
        {
          ul: [
            { text: 'Por favor llegar al Hospital al 30 minutos antes de la hora de su cita. A su llegada, favor dirigirse directamente a la Oficina Internacional.', style: 'notesContent' },
            { text: 'Recuerde traer con usted identificación (pasaporte y/o licencia de conducir junto a su carnet de seguro médico internacional).', style: 'notesContent' },
            { text: 'El día de su cirugía, favor llegar al Hospital a las 5:30 a.m. para iniciar su preparación prequirúrgica.', style: 'notesContent' },
            { text: 'Las consultas médicas con proveedores afiliados a la red están sujetas a un copago de US$25.00.', style: 'notesContent' },
            { text: 'Los Dres. Igor Palacios, MD, Allan Pineda, MD y John Siliski, MD, forman parte de los proveedores afiliados a la red de Humano (United Healthcare).', style: 'notesContent' },
            { text: 'De acuerdo al plan bajo el cual está amparado, su deducible internacional anual es de US$2,500.00, el cual no ha sido copado.', style: 'notesContent' },
            { text: 'Luego de copar su deducible, su cobertura es al 100% según las condiciones de su contrato.', style: 'notesContent' },
            { text: 'La compra de medicamentos se maneja mediante reembolso.', style: 'notesContent' },
            { text: 'En caso de incurrir en cualquier gasto, favor de siempre pedir: Factura detallada de los servicios, que contenga procedimientos y diagnósticos con sus códigos. Asimismo Recibo de pago.', style: 'notesContent' }
          ],
          pageBreak: 'after'
        }, // page7
        { text: '', pageBreak: 'after' }, // page8
        { 
          text: 'SOBRE EL DOCTOR',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after' 
        }, // page9
        { text: '', pageBreak: 'after' }, // page10
        { 
          text: 'SOBRE EL HOSPITAL',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after' 
        }, // page11
        { text: '', pageBreak: 'after' }, // page12
        {
          text: 'SOBRE LA CIUDAD',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after'
        }, // page13
        { text: '', pageBreak: 'after' }, // page14
        {
          text: 'ESTADÍA & HOSPITALES',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after'
        }, // page15
        {
          text: 'ATRACCIONES',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after'
        }, // page16
        {
          text: 'OTRAS INFORMACIONES',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after'
        }, // page17
        { text: '', pageBreak: 'after' }, // page18
        { text: '' }, // page19
      ],
      styles: {
        title: {
          fontSize: 44,
          bold: true,
          lineHeight: 0.85,
          color: '#20375c',
        },
        tableHeader: {
          bold: true,
          fontSize: 14,
          color: 'white',
          margin: [0, 5, 0, 0],
        },
        tableSubHeader: {
          margin: [0, 5, 0, 5],
        },
        notesHeader: {
          bold: true,
          fontSize: 16,
          color: '#20375c',
          margin: [0, 80, 0, 5]
        },
        notesContent: {
          italics: true,
          color: 'gray',
          fontSize: 10.5
        },
        pageTitle: {
          fontSize: 24,
          color: '#20375c',
          bold: true,
          lineHeight: 1.2,
			    alignment: 'center',
        },
        item:{
          fontSize: 24,
          color: '#20375c',
          lineHeight: 1.2,
        },
        defaultStyle: {
          fontSize: 10,
          color: '#333333'
        }
      },
    };

    const pdfUrl = await _upload.generatePDFWithPdfmake({
      account,
      table: "t_event",
      id: req.params.id,
      filename,
      docDefinition,
    });

    return res.status(200).json({ item, filename, pdfUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
