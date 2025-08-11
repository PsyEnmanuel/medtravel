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

const BACKGROUNDS = {frontPage, carnet, imagesAndContent:content1, titlePages: content2, lastPage: branches }
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
          itinerary.provider_logo = provider.logo;
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
          itinerary.doctor_address = doctor.address;
          itinerary.doctor_name = doctor.description;
          itinerary.doctor_bio = doctor.bio;
          itinerary.doctor_profile_pic = await _query.getProfilePic({ ref_key: "t_doctor", ref_id: itinerary.doctor_id });
          
          if (doctor.postnominal) {
            itinerary.doctor_posnominal = JSON.parse(doctor.postnominal);
          } else {
            itinerary.doctor_posnominal = [];
          }

          if (doctor.speciality) {
            itinerary.doctor_speciality = JSON.parse(doctor.speciality);
          } else {
            itinerary.doctor_speciality = [];
          }
        }
      }
    }

    const provider = await _query.getRowById({
      id: item.provider_id,
      table: "t_provider",
      user,
    });

    
    let provider_files;
    if (provider) {
      item.provider_place = `${provider.description}, ${provider.country}, ${provider.city}`;
      provider_files = await _query.getFiles({ ref_key: "t_provider", ref_id: item.provider_id });
      if (provider_files == null ? void 0 : provider_files.length) {
        const [provider_file] = provider_files.filter((i) => i.$file_type_id === 198);
        const [provider_mapa] = provider_files.filter((i) => i.$file_type_id === 380);
        item.provider_file = provider_file == null ? void 0 : provider_file.url;
        item.provider_map = provider_mapa == null ? void 0 : provider_mapa.url;
      }
      item.provider_profile_pic = await _query.getProfilePic({ ref_key: "t_provider", ref_id: item.provider_id });
    }
    const files = await getFiles({ ref_key: "t_event", ref_id: req.params.id });

    let carnets = [];
    let vobs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.$file_type_id === 314) {
        const url = _upload.getFilePathFromUrl(file.url);
        carnets.push(url);
      }
      if (file.$file_type_id === 197) {
        if (file.icon === "pdf") {
          const url = _upload.getFilePathFromUrl(file.url);
          const allFiles = await _upload.pdfToImg2(url);
          for (let j = 0; j < allFiles.length; j++) {
            const vobs_file = _upload.publicPath({ account, table: "t_event", filename: allFiles[j] });
            const url = _upload.getFilePathFromUrl(vobs_file);
            vobs.push(url);
          }
        } else {
          const url = _upload.getFilePathFromUrl(file.url);
          vobs.push(url);
        } 
      }
    }

    item.carnets = carnets
    item.vobs = vobs

    const events_itineraries = itineraries.map((itinerary) => {
      const {
        attendance_day, 
        attendance_date, 
        attendance_time, 
        attendance_time_format, 
        provider_description, 
        provider_address,
        doctor_description,
        doctor_speciality
      } = itinerary;
      return [
              { 
                stack: [
                  { text: attendance_day.toUpperCase(), bold: false, fontSize: 9 },
                  { text: attendance_date, bold: true, fontSize: 9 }
                ],
                style: 'tableSubHeader',
                alignment: 'center'
              },
              { 
                stack: [
                  { text: `${attendance_time} ${attendance_time_format}`, bold:true, fontSize: 9 },
                  { text: 'CONSULTA', fontSize: 8 }
                ],
                style: 'tableSubHeader',
                alignment: 'center'
              },
              { 
                stack: [
                  { text: provider_description, bold: true, fontSize: 9, lineHeight: 0.7 },
                  { text: provider_address, fontSize: 8 }
                ],
                style: 'tableSubHeader',
                alignment: 'center'
              },
              { 
                stack: [
                  { text: doctor_description, bold: true, fontSize: 9, lineHeight: 0.7 },
                  { text: doctor_speciality.length > 1 
                    ? doctor_speciality.map(s => s.description).join(', ')
                    : doctor_speciality[0].description,
                    fontSize: 8 
                  }
                ],
                style: 'tableSubHeader',
                alignment: 'center'
              }
            ]
    });

    const doctors = itineraries.map(itinerary => {
      const {
        doctor_profile_pic,
        doctor_name,
        doctor_posnominal,
        doctor_bio, 
        doctor_speciality
      } = itinerary;
      return [
            {
              table: {
                widths: [100, '*'],
                body: [
                  [
                    {
                      image: _upload.convertImageUrltoBase64(_upload.getFilePathFromUrl(doctor_profile_pic.url)),
                      width: 100,
                      height: 120
                    },
                    {
                      stack: [
                        { text: `${doctor_name}${doctor_posnominal ? `, ${doctor_posnominal.length > 1 ? doctor_posnominal.join(', ') : doctor_posnominal[0]}` :''}`, style: 'doctor_name' },
                        { text: doctor_speciality.length > 1 ? doctor_speciality.map(s => s.description).join(', ') : doctor_speciality[0].description, style: 'doctor_title' }
                      ],
                      margin: [10, 40, 0, 0]
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: () => 10,
                paddingRight: () => 10,
                paddingTop: () => 10,
                paddingBottom: () => 10,
                fillColor: '#183F73'
              }
            },
            { text: '\n' },
            {
              text: doctor_bio, style: 'paragraph'
            }
          ]
    })

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 150, 40, 60], 
      background: function (currentPage) {
        let bg = BACKGROUNDS.titlePages;
        if(currentPage === 1) {
          bg = BACKGROUNDS.frontPage;
        }
        if(currentPage > 1 && currentPage < item.carnets.length + 2) {
          bg = BACKGROUNDS.carnet;
        }
        if(currentPage > item.carnets.length + 1  && currentPage < item.carnets.length + 3) {
          bg = BACKGROUNDS.imagesAndContent;
        }
        if(currentPage > item.carnets.length + 4 && currentPage < item.vobs.length + item.carnets.length + 5) {
          bg = BACKGROUNDS.imagesAndContent
        }
        if(currentPage > item.vobs.length + item.carnets.length + 5 && currentPage < item.vobs.length + item.carnets.length + 8) {
          bg = BACKGROUNDS.imagesAndContent
        }
        if(currentPage > item.vobs.length + item.carnets.length + 8 && currentPage < item.vobs.length + item.carnets.length + 10) {
          bg = BACKGROUNDS.imagesAndContent
        }
        if(currentPage > item.vobs.length + item.carnets.length + 10 && currentPage < item.vobs.length + item.carnets.length + 12) {
          bg = BACKGROUNDS.imagesAndContent
        }
        if(currentPage > item.vobs.length + item.carnets.length + 12 && currentPage < item.vobs.length + item.carnets.length + itineraries.length + 14) {
          bg = BACKGROUNDS.imagesAndContent
        }
        if(currentPage > item.vobs.length + item.carnets.length + itineraries.length + 18 && currentPage < item.vobs.length + item.carnets.length + itineraries.length + 19) {
          bg = BACKGROUNDS.imagesAndContent
        }
        if(currentPage === item.vobs.length + item.carnets.length + itineraries.length + 18){
          bg = BACKGROUNDS.lastPage;
        }

        return {
          image: `data:image/png;base64,${bg}`,
          width: 595,
          height: 842
        };
      },
      content: [
        { text: '', pageBreak: 'after' }, // page1
        ...(item.carnets.length ? item.carnets.map(carnet => ({ image: _upload.convertImageUrltoBase64(carnet), width: 350, alignment: 'center', })) : [{}]),
        { text: '', pageBreak: 'after' }, // page2
        { image: 'logo', width: 350, alignment: 'center', pageBreak: 'after' }, // page3
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
        ...(item.vobs.length ? item.vobs.map(vob => ({ image: _upload.convertImageUrltoBase64(vob), width: 350, alignment: 'center', })) : [{}]),
        { text: '', pageBreak: 'after' }, // break after vobs
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
              ...events_itineraries,
              [
                { text: ' ', style: 'tableHeader', alignment: 'center', minHeight: 40 },
                { text: ' ', style: 'tableHeader', alignment: 'center', minHeight: 40 },
                { text: ' ', style: 'tableHeader', alignment: 'center', minHeight: 40 },
                { text: ' ', style: 'tableHeader', alignment: 'center', minHeight: 40 }
              ]
            ]
          },
          layout: {
            fillColor: function (rowIndex, node) {
              const lastRowIndex = node.table.body.length - 1;
              if (rowIndex === 0) {
                return '#1b355e';
              }
              if (rowIndex === lastRowIndex) {
                return '#f2f2f2';
              }
              return null;
            },
            hLineWidth: function () { return 0.3; },
            vLineWidth: function () { return 0.3; },
            hLineColor: function () { return 'white'; },
            vLineColor: function () { return 'white'; }
          },
          margin: [-15, 0, 15, 0],
          pageBreak: 'after'
        },  // page7 
        {
          stack: [
            { text: 'CONTACTOS', style: 'title', margin: [0, 0, 0, 10] },
            {
              columns: [
                {
                  stack: [
                    { text: 'Laura Suárez', style: 'contactInfo', bold: true, lineHeight: 0.8 },
                    { text: 'Client liaison, International Patient Center', style: 'contactInfo' },
                    { text: 'International and Specialized Services', style: 'contactInfo' },
                    { text: 'Massachusetts General Hospital', style: 'contactInfo' },
                    { text: '| Mass Eye and Ear', style: 'contactInfo' },
                    { text: '55 Fruit St, Blake building, Site 180 Boston,', style: 'contactInfo' },
                    { text: 'MA 02114', style: 'contactInfo' },
                    { text: 'T 617-726-1442 | F 617-726-2543', style: 'contactInfo' },
                    { text: 'Email: LSUAREZ5@mgh.harvard.edu', link: 'mailto:LSUAREZ5@mgh.harvard.edu', style: 'contactInfo', bold: true, margin: [0, 0, 0, 15] },
                    
                    { text: 'Gleisi Tatis Herrera', style: 'contactInfo', bold: true, lineHeight: 0.8 },
                    { text: 'Oficial de Coordinaciones Medicas', style: 'contactInfo' },
                    { text: 'Seguros de Personas internacional', style: 'contactInfo' },
                    { text: 'Matos Corredores de Seguros', style: 'contactInfo' },
                    { text: 'T. 809-620-0000 / C. 829-745-2816 / ', style: 'contactInfo' },
                    { text: 'F. 857-702-9210', style: 'contactInfo' },
                    { text: 'Email: gtatis@momatos.com', link: 'mailto:gtatis@momatos.com', style: 'contactInfo', bold: true }
                  ],
                  width: '50%'
                },
                {
                  stack: [
                    { text: 'Manuel José Matos', style: 'contactInfo', bold: true, lineHeight: 0.8 },
                    { text: 'Director Ejecutivo', style: 'contactInfo' },
                    { text: 'Matos Corredores de Seguros', style: 'contactInfo' },
                    { text: 'T. 809-620-0000 / C. 829-421-1761 / F. 857-702-9210', style: 'contactInfo' },
                    { text: 'Email: manueljmatos@momatos.com', link: 'mailto:manueljmatos@momatos.com', style: 'contactInfo', bold: true, margin: [0, 0, 0, 15] },
                    
                    { text: 'José Luís Martínez', style: 'contactInfo', bold: true, lineHeight: 0.8 },
                    { text: 'Gerente de Coordinaciones Medicas', style: 'contactInfo' },
                    { text: 'Seguros de Personas internacional', style: 'contactInfo' },
                    { text: 'Matos Corredores de Seguros', style: 'contactInfo' },
                    { text: 'T. 809-620-0000 / C. 829-421-1761 / F. 857-702-9210', style: 'contactInfo' },
                    { text: 'Email: jmartinez@momatos.com', link: 'mailto:jmartinez@momatos.com', style: 'contactInfo', bold: true, margin: [0, 0, 0, 15] },
                    
                    { text: 'Priscila García', style: 'contactInfo', bold: true, lineHeight: 0.8 },
                    { text: 'Gerente de Negocios', style: 'contactInfo' },
                    { text: 'Seguros de Personas internacional', style: 'contactInfo' },
                    { text: 'Matos Corredores de Seguros', style: 'contactInfo' },
                    { text: 'T. 809-620-0000 / C. 829-760-4624 / F. 857-702-9210', style: 'contactInfo' },
                    { text: 'Email: pgarcia@momatos.com', link: 'mailto:pgarcia@momatos.com', style: 'contactInfo', bold: true }
                  ],
                  width: '50%'
                }
              ],
            },
          ],
          margin: [0, 20, 0, 0],
          pageBreak: 'after'
        }, // page8
        { 
          text: 'SOBRE EL DOCTOR',
          style: 'title',
			    alignment: 'center',
          absolutePosition: { x: 0, y: 390 }, 
          pageBreak: 'after' 
        }, // page9
        { 
          stack: doctors, 
          pageBreak: 'after'
        }, // page10
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
      images: {
        logo: _upload.convertImageUrltoBase64(_upload.getFilePathFromUrl(item.provider_profile_pic.url)),
      },
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
        contactInfo: {
          color: '#20375c',
          fontSize: 10.5
        },
        pageTitle: {
          fontSize: 24,
          bold: true,
          lineHeight: .2,
			    alignment: 'center',
        },
        item:{
          fontSize: 24,
          color: '#20375c',
          lineHeight: 1.2,
        }, 
        doctor_name: {
          font: 'OpenSans',
          fontSize: 20,
          lineHeight: 0.8,
          bold: true,
          color: '#FFFFFF'
        },
        doctor_title: {
          font: 'OpenSans',
          fontSize: 20,
          color: '#FFFFFF'
        },
        paragraph:{
          font: 'OpenSans',
          fontSize: 13,
          color: '#20375c',
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
