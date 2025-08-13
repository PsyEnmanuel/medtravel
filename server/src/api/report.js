import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _template, _upload } from "../helpers/index.js";
import { generateMedicalGuideDoc } from "../services/report.js";
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
          const [doctor_profile] = await _query.getFiles({ ref_key: 't_doctor', ref_id: doctor.id });
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
      provider_files = await _query.getFiles({ ref_key: 't_provider', ref_id: data.provider.id });

      if (provider_files?.length) {
          const [provider_file] = provider_files.filter(i => i.$file_type_id === 198)
          const [provider_mapa] = provider_files.filter(i => i.$file_type_id === 380)
          data.provider.file = provider_file?.url
          data.provider.mapa = provider_mapa?.url
      }
      data._files.provider = await _upload.getProfilePic({ ref_key: 't_provider', ref_id: item.provider_id });
    }

    const files = await _query.getFiles({ ref_key: 't_event', ref_id: req.params.id });

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

    const provider = await _query.getRowById({
      id: item.provider_id,
      table: "t_provider",
      user,
    });

    const files = await _query.getFiles({ ref_key: "t_event", ref_id: req.params.id });

    const { docDefinition, pending_list } = await generateMedicalGuideDoc({ item, itineraries, provider, files, account, user })

    const pdfUrl = await _upload.generatePDFWithPdfmake({
      account,
      table: "t_event",
      filename,
      docDefinition,
    });

    return res.status(200).json({ item, filename, pdfUrl, pending_list });
  } catch (error) {
    next(error);
  }
});

export default router;
