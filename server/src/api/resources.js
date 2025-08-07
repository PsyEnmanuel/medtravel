import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _upload } from "../helpers/index.js";
import axios from "axios";
import path from "path"
import fs from "fs"
import crypto from "crypto";

const router = express.Router();

router.use(isAuthenticated);

router.get("/google-static-maps-api", async function (req, res, next) {
  try {

    const user = res.locals.user;
    const account = res.locals.account;
    const query = req.query

    const _url = await _upload.getFinalMapUrl(req.query.link_gps)

    const {
      placeName,
      lat,
      lng
    } = _upload.extractMapInfo(_url)

    // console.log(lat);
    // console.log(lng);
    // console.log(placeName);
    // return res.status(200).json(true);

    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(placeName)}&zoom=18&size=1280x720&maptype=roadmap&markers=color:red%7C${encodeURIComponent(placeName)}&key=${process.env.GOOGLE_MAP}`;
    console.log(1, url);

    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream'
    });

    const buf = await crypto.randomBytes(16).toString('hex');
    const filename = `${buf}.jpg`

    const filePath = path.join(path.resolve(), `/privated/uploads/${account.domain}/${req.query.ref_key}/${req.query.ref_id}/${filename}`);
    _upload.createFolders(_upload.uploadDir, [account.domain, query.ref_key, query.ref_id]);
    const publicPath = _upload.publicPath({ account, table: query.ref_key, id: query.ref_id, filename })


    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await _query.insert({
      table: 't_file',
      user,
      data: {
        ref_key: query.ref_key,
        ref_id: query.ref_id,
        $file_type_id: 380,
        description: query.address,
        url: publicPath,
        type: 'image'
      },
    });


    return res.status(200).json(true);

  } catch (error) {
    next(error);
  }
});

router.get("/calendarific", async function (req, res, next) {
  try {

    const url = `https://calendarific.com/api/v2/holidays?&api_key=${process.env.CALENDARIFIC_API}&country=${req.query.country}&year=2025&type=national&language=es`

    const response = await axios({
      method: "get",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });

    return res.status(200).json(response.data.response.holidays);
  } catch (error) {
    next(error);
  }
});

router.get("/zippopotam", async function (req, res, next) {
  try {

    const url = `https://api.zippopotam.us/${req.query.country_code}/${req.query.zipcode}`

    const response = await axios({
      method: "get",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });

    console.log(12, response.data);

    return res.status(200).json(response.data);

  } catch (error) {
    next(error);
  }
});

router.get("/geonames/timezoneJSON", async function (req, res, next) {
  try {
    console.log(req.query);
    const url = `http://api.geonames.org/timezoneJSON?lat=${req.query.lat}&lng=${req.query.lng}&username=enmanuelma`

    const response = await axios({
      method: "get",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });

    return res.status(200).json(response.data);

  } catch (error) {
    next(error);
  }
});

export default router;
