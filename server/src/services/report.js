
import path from "path";
import fs from "fs";
import { _date, _query, _upload, _images } from "../helpers/index.js";

const imagesBase64Dir = path.join(path.resolve(), "/public/base64/");
const frontPage = fs.readFileSync(`${imagesBase64Dir}/guia1.png`).toString('base64');
const carnet = fs.readFileSync(`${imagesBase64Dir}/guia2.png`).toString('base64');
const content1 = fs.readFileSync(`${imagesBase64Dir}/guia3.png`).toString('base64');
const content2 = fs.readFileSync(`${imagesBase64Dir}/guia4.png`).toString('base64');
const branches = fs.readFileSync(`${imagesBase64Dir}/guia19.png`).toString('base64');

const BACKGROUNDS = { frontPage, carnet, imagesAndContent: content1, titlePages: content2, lastPage: branches }

export async function generateMedicalGuideDoc({ item, itineraries, provider, files, account, user }) {
  let provider_files;
  let hasDoctorsLogo = true;

  if (provider) {
    item.provider_description = provider.description;
    item.provider_detail = provider.detail;
    item.provider_location = provider.city ? `${provider.city}, ${provider.country}` : provider.country;
    item.provider_place = `${provider.description}, ${provider.country}, ${provider.city}`;
    provider_files = await _query.getFiles({ ref_key: "t_provider", ref_id: item.provider_id });
    if (provider_files == null ? void 0 : provider_files.length) {
      const [provider_file] = provider_files.filter((i) => i.$file_type_id === 198);
      const [provider_mapa] = provider_files.filter((i) => i.$file_type_id === 380);
      item.provider_file = provider_file == null ? void 0 : provider_file.url;
      item.provider_map = provider_mapa == null ? void 0 : provider_mapa.url;
    }
    const ProviderLogoImg = await _query.getProfilePic({ ref_key: "t_provider", ref_id: item.provider_id });
    if (ProviderLogoImg) {
      item.provider_profile_pic = await _images.handleImageOrFile(ProviderLogoImg);
    }
  }

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
        itinerary.doctor_description = doctor.description;
        itinerary.doctor_bio = doctor.bio;
        const doctorProfile = await _query.getProfilePic({ ref_key: "t_doctor", ref_id: itinerary.doctor_id });
        if (doctorProfile) {
          itinerary.doctor_profile_pic = await _images.handleImageOrFile(doctorProfile);
        } else {
          hasDoctorsLogo = false
        }

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

  let carnets = [];
  let vobs = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.$file_type_id === 314) {
      const img = await _images.handleImageOrFile(file);
      carnets.push(img);
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
          { text: `${attendance_time} ${attendance_time_format}`, bold: true, fontSize: 9 },
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
          {
            text: doctor_speciality ? doctor_speciality.length > 1
              ? doctor_speciality.map(s => s.description).join(', ')
              : doctor_speciality[0].description : '',
            fontSize: 8
          }
        ],
        style: 'tableSubHeader',
        alignment: 'center'
      }
    ]
  });


  const doctors = itineraries.filter(itinerary_doctor => itinerary_doctor.doctor_description).map(itinerary => {
    const {
      doctor_profile_pic,
      doctor_description,
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
              ...(doctor_profile_pic ? [{
                image: doctor_profile_pic,
                width: 100,
                height: 120
              }] : [{ text: '', image: '', width: 100, height: 120 }]),
              {
                stack: [
                  { text: `${doctor_description}${doctor_posnominal ? `, ${doctor_posnominal.length > 1 ? doctor_posnominal.join(', ').toUpperCase() : doctor_posnominal[0].toUpperCase()}` : ''}`, style: 'doctor_name' },
                  { text: doctor_speciality ? doctor_speciality.length > 1 ? doctor_speciality.map(s => s.description).join(', ').toUpperCase() : doctor_speciality[0].description.toUpperCase() : '', style: 'doctor_title' }
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
  const hasProviderLogo = !!item.provider_profile_pic;
  const hasCarnets = (item.carnets?.length || 0 > 0);
  const hasVobs = (item.vobs?.length || 0) > 0;
  const hasDoctors = (doctors?.length || 0) > 0;
  const hasEvents = (events_itineraries?.length || 0) > 0;
  const hasProviderInfo = !!(item.provider_description || item.provider_detail || item.provider_location);
  const hasHowTo = !!(item.provider_location || item.provider_place || !!item.provider_map);
  const hasMap = !!item.provider_map;

  const sectionTitlesMap = {
    precertTitle: 'Pre-certificación',
    citasTitle: 'Citas Médicas',
    doctorTitle: 'Sobre el Doctor',
    hospitalTitle: 'Sobre el Hospital',
    howTo: 'Sobre la Ciudad',
    contact: 'Contactos',
    hospitalContent: 'Estadía y Hospital',
    atracciones: 'Atracciones',
    otras: 'Otras Informaciones'
  };

  const dynamicUL = [
    hasVobs ? sectionTitlesMap.precertTitle : null,
    hasEvents ? sectionTitlesMap.citasTitle : null,
    hasDoctors ? sectionTitlesMap.doctorTitle : null,
    hasProviderInfo ? sectionTitlesMap.hospitalTitle : null,
    hasHowTo ? sectionTitlesMap.howTo : null,
    sectionTitlesMap.contact,
    hasProviderInfo ? sectionTitlesMap.hospitalContent : null,
    item.atracciones?.length > 0 ? sectionTitlesMap.atracciones : null,
    sectionTitlesMap.otras
  ].filter(Boolean); // remove nulls

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 150, 40, 60],
    background: function (currentPage) {
      let page = 2; // first page after front cover
      const ranges = {};
      const addRange = (key, pages) => {
        if (!pages || pages <= 0) return null;
        const start = page;
        const end = start + pages - 1;
        ranges[key] = [start, end];
        page = end + 1;
        return ranges[key];
      };

      // 1) Carnets (N pages)
      if (hasCarnets) {
        addRange('carnets', item.carnets?.length);
      }
      // 2) Logo (1 page if present)
      if (hasProviderLogo) {
        addRange('logo', 1);
      }

      // 3) CONTENIDO (always 1 page)
      addRange('contenido', 1);

      // 4) PRE-CERT title (1) + VOBS (M pages) if present
      if (hasVobs) {
        addRange('precertTitle', 1);
        addRange('vobs', item.vobs.length);
      }

      // 5) CITAS MÉDICAS: title (1) + table (1) if there are events
      if (hasEvents) {
        addRange('citasTitle', 1);
        addRange('citasTable', 1);
      }

      // 6) CONTACTOS (always 1 page)
      addRange('contactos', 1);

      // 7) SOBRE EL DOCTOR: title (1) + content (1) if present
      if (hasDoctors) {
        addRange('doctorTitle', 1);
        addRange('doctorContent', doctors.length);
      }

      // 8) SOBRE EL HOSPITAL: title (1) + content (1) if provider info exists
      if (hasProviderInfo) {
        addRange('hospitalTitle', 1);
        addRange('hospitalContent', 1);
      }

      // 9) ¿CÓMO LLEGAR? (1) if there is place/location
      if (hasHowTo) {
        addRange('howTo', 1);
      }

      // Compute the real last page AFTER all other sections are added
      const lastPage = page;
      const inRange = (p, range) => range && p >= range[0] && p <= range[1];

      let bg = BACKGROUNDS.titlePages; // default fallback

      if (currentPage === 1) {
        bg = BACKGROUNDS.frontPage;
      } else if (currentPage === lastPage) {
        bg = BACKGROUNDS.lastPage;
      } else if (ranges.carnets && inRange(currentPage, ranges.carnets)) {
        bg = BACKGROUNDS.carnet;
      } else if (
        ['contenido', 'precertTitle', 'citasTitle', 'doctorTitle', 'hospitalTitle'].some(
          key => ranges[key] && inRange(currentPage, ranges[key])
        )
      ) {
        // Section title pages
        bg = BACKGROUNDS.titlePages;
      } else if (
        Object.entries(ranges).some(([key, range]) =>
          range && !['contenido', 'precertTitle', 'citasTitle', 'doctorTitle', 'hospitalTitle', 'carnets'].includes(key) &&
          inRange(currentPage, range)
        )
      ) {
        // All other content pages
        bg = BACKGROUNDS.imagesAndContent;
      }

      return {
        image: `data:image/png;base64,${bg}`,
        width: 595,
        height: 842
      };
    },
    content: [
      { text: '', pageBreak: 'after' },
      ...(hasCarnets ? item.carnets.map(carnet => ({ image: carnet, width: 350, alignment: 'center', pageBreak: 'after' })) : [{}]),
      ...(hasProviderLogo ? [{ image: 'logo', width: 350, alignment: 'center', pageBreak: 'after' }] : []),
      { text: 'CONTENIDO', style: "title", margin: [30, 35, 0, 0] },
      {
        type: 'square',
        style: 'item',
        ul: dynamicUL,
        margin: [30, 0, 0, 0],
        pageBreak: 'after'
      },
      ...(hasVobs ? [{
        text: 'PRE-CERTIFICACIÓN',
        style: 'title',
        alignment: 'center',
        absolutePosition: { x: 0, y: 390 },
        pageBreak: 'after'
      },
      ...item.vobs.map(vob => ({ image: _upload.convertImageUrltoBase64(vob), width: 350, alignment: 'center', pageBreak: 'after' }))]
        : [{}]),
      ...(hasEvents ? [{
        text: 'CITAS MÉDICAS',
        style: 'title',
        alignment: 'center',
        absolutePosition: { x: 0, y: 390 },
        pageBreak: 'after'
      },
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
      }] : []),
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
      },
      ...(hasDoctors ? [{
        text: 'SOBRE EL DOCTOR',
        style: 'title',
        alignment: 'center',
        absolutePosition: { x: 0, y: 390 },
        pageBreak: 'after'
      },
      doctors.map(doctor => ({
        stack: doctor,
        pageBreak: 'after'
      }))] : []),
      ...(hasProviderInfo ? [
        {
          text: 'SOBRE EL HOSPITAL',
          style: 'title',
          alignment: 'center',
          absolutePosition: { x: 0, y: 390 },
          pageBreak: 'after'
        },
        {
          text: item.provider_description,
          style: 'item',
          bold: true,
          margin: [0, 0, 0, 10],
        },
        {
          text: item.provider_detail,
          style: 'body',
        },
        {
          margin: [0, 15, 0, 5],
          table: {
            widths: ['auto', '*'],
            body: [
              [
                { text: 'UBICACIÓN:', style: 'locationLabel' },
                { text: item.provider_location, style: 'locationValue' }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex) => {
              return rowIndex === 0 ? '#1a3354' : null;
            },
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingBottom: () => 4
          },
          pageBreak: 'after'
        }] : []),
      // {
      //   text: 'SOBRE LA CIUDAD',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page13
      // {
      //   text: 'ESTADÍA & HOSPITALES',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page15
      // {
      //   text: 'ATRACCIONES',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page16
      // {
      //   text: 'OTRAS INFORMACIONES',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page17
      ...(hasHowTo ? [
        {
          text: '¿CÓMO LLEGAR?',
          style: 'headerMap',
          alignment: 'center',
          margin: [0, 50, 0, 10],
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: [
                    { text: 'UBICACIÓN: ', bold: true },
                    item.provider_location,
                  ],
                  alignment: 'center',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: item.provider_place,
                  italics: true,
                  alignment: 'center',
                  margin: [0, 0, 0, 20],
                },
              ],
            },
          ]
        },
        ...(hasMap ? [{
          image: 'map',
          width: 500,
          alignment: 'center'
        }] : []),
        { text: '', pageBreak: 'after' }
      ] : []),
    ],
    images: {
      logo: item.provider_profile_pic ? item.provider_profile_pic : undefined,
      map: item.provider_map ? _upload.convertImageUrltoBase64(_upload.getFilePathFromUrl(item.provider_map)) : undefined
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
      headerMap: {
        bold: true,
        fontSize: 35,
        color: '#20375c',
      },
      item: {
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
      paragraph: {
        font: 'OpenSans',
        fontSize: 10,
        color: '#20375c',
      },
      locationLabel: {
        fontSize: 10,
        bold: true,
        color: '#ffffff'
      },
      locationValue: {
        fontSize: 10,
        color: '#ffffff'
      },
      defaultStyle: {
        fontSize: 10,
        color: '#333333'
      }
    },
  };

  const pending_list = { hasCarnets, hasProviderLogo, hasVobs, hasEvents, hasDoctors, hasProviderInfo, hasHowTo, hasMap, hasDoctorsLogo };
  return { docDefinition, pending_list }
}