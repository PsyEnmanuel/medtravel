import multer from "multer";
import path from "path";
import puppeteer from "puppeteer";
import sharp from "sharp";
import fs from "fs";
import ejs from "ejs";
import { _constant } from "./index.js";
import crypto from "crypto";
import { load } from "@pspdfkit/nodejs";
import PDFMerger from "pdf-merger-js";
import { pdfToImg } from "pdftoimg-js";
import PdfPrinter from "pdfmake";
let browser;

export const uploadDir = path.join(path.resolve(), "/privated/uploads/");
const imagesBase64Dir = path.join(path.resolve(), "/public/base64/");

export function getFilePathFromUrl(fileUrl) {
  const url = new URL(fileUrl);
  const relativePath = url.pathname.replace("/privated/uploads/", ""); // Remove base URL path
  const filePath = path.join(uploadDir, relativePath); // Join with uploadDir

  return filePath;
}

export async function pdfToImg2(pdf_document) {
  try {

    const images = await pdfToImg(pdf_document, {
      pages: "all",
      imgType: "png",
      scale: 2,
      background: "white",
    });
    let files = []
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filename = `tempora${i}.png`
      const tmpImage = path.join(uploadDir, filename)
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64")
      await fs.writeFileSync(tmpImage, buffer);
      files.push(filename)

    }


    return files
  } catch (error) {
    console.log(error);
  }
}

// pdfToImg2(`/home/lina/app/medtravel/server/privated/uploads/MEDTRAVEL/t_event/250/fdf90188ef2b3a6701175122ced3b3ce.pdf`)

export function convertImagetoBase64(file) {
  // Read the image file as a Buffer
  const imageBuffer = fs.readFileSync(`${imagesBase64Dir}/${file}`);

  // Convert the Buffer to base64 encoding
  const base64Image = imageBuffer.toString("base64");

  return `data:image/png;base64,${base64Image}`;
}

const storage = multer.diskStorage({
  destination: uploadDir,
});

export function createFolders(destination, arr) {
  for (const item of arr) {
    destination += "/" + item;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }
  }
}

function checkImageFile(file) {
  return /(\.|\/)(gif|jpg|jpeg|tiff|jfif|png|webp)$/i.test(file);
}

function checkDocFile(file) {
  return /(\.|\/)(pdf|xls|xlsx|doc|docx|sheet)$/i.test(file);
}

function checkDCMFile(file) {
  return /(\.|\/)(dcm)$/i.test(file);
}

function checkPdfFile(file) {
  return /(\.|\/)(pdf)$/i.test(file);
}

function checkWordFile(file) {
  return /(\.|\/)(doc|docx|dot|dotx|txt|wps)$/i.test(file);
}

function checkExcelFile(file) {
  return /(\.|\/)(xls|xlsx|sheet|csv)$/i.test(file);
}

function checkVideoFile(file) {
  return /(\.|\/)(mp4|webm)$/i.test(file);
}

function checkAudioFile(file) {
  return /(\.|\/)(mp3)$/i.test(file);
}

function checkFileType(file) {
  // Allowed ext
  const filetypes =
    /(\.|\/)(gif|jpg|jpeg|tiff|png|pdf|xls|xlsx|doc|docx|sheet|mp4|mp3|webm|webp|jfif|dot|dotx|txt|wps|dcm)$/i;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return true;
  } else {
    return false;
  }
}

export const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: 30000000 },
  fileFilter: function (req, file, cb) {
    let res = checkFileType(file);
    if (!res) {
      cb(new Error("Solo Archivos Permitidos"));
    } else {
      cb(null, true);
    }
  },
}).array("file");

export async function uploadDestination({ account, table, id, file }) {
  createFolders(file.destination, [account.domain, table, id]);

  const filename = file.filename + "." + file.originalname.split(".").pop();

  const data = {
    url: publicPath({ account, table, id, filename }),
    type: null,
  };

  let destination;
  let target;

  if (id) {
    destination = `${file.destination}/${account.domain}/${table}/${id}/`;
    target = `${destination}/${filename}`;
  } else {
    destination = `${file.destination}/tmp`;
    target = `${destination}/${filename}`; `${process.env.DOMAIN}/privated/uploads/tmp/${filename}`;
  }

  fs.renameSync(file.path, target);

  if (checkImageFile(file.originalname)) {
    // await resizeFile({
    //   target: file.path,
    //   destination,
    //   filename,
    // });
    // fs.unlinkSync(file.path)
    data.type = "image";
    for (let i = 0; i < _constant.sizes.length; i++) {
      const size = _constant.sizes[i];
      const resizedFile = await resizeFile({
        target,
        destination,
        filename,
        size,
      });
      data[size.type] = publicPath({
        account,
        table,
        id,
        filename: resizedFile,
      });
    }
    return data;
  }

  if (checkVideoFile(file.originalname)) {
    data.type = "video";
    data.icon = "video";
    return data;
  }

  if (checkAudioFile(file.originalname)) {
    data.type = "audio";
    data.icon = "audio";
    return data;
  }

  if (checkDocFile(file.originalname)) {
    data.type = "document";
    if (checkWordFile(file.originalname)) {
      data.icon = "word";
    } else if (checkPdfFile(file.originalname)) {
      data.icon = "pdf";
    } else if (checkExcelFile(file.originalname)) {
      data.icon = "excel";
    }

    return { ...data, destination, filename };
  }

  if (checkDCMFile(file.originalname)) {
    data.type = "dcm";
    data.icon = "dcm";
    return { ...data, destination, filename };
  }
}

export async function resizeFile({ target, destination, filename, size }) {
  try {
    if (size) {
      filename = `${size.type}/${filename}`;
      createFolders(destination, [size.type]);
    }
    await sharp(target, { failOnError: false })
      .resize(size?.resize || 1200, size?.resize || 1200, {
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .withMetadata()
      .toFile(`${destination}/${filename}`);
    return filename;
  } catch (error) {
    console.log("sharp-error", error);
  }
}

export function publicPath({ account, table, id, filename }) {
  if (id) {
    return `${process.env.DOMAIN}/privated/uploads/${account.domain}/${table}/${id}/${filename}`;
  } else {
    return `${process.env.DOMAIN}/privated/uploads/tmp/${filename}`;
  }
}

export function filePath(file) {
  file = file.replace(/.+?(?=upload)/, "");
  return path.join(path.resolve(), "/privated", file);
}

export async function imageToPDF(images) {
  const paths = [];
  for (let i = 0; i < images.length; i++) {

    const buf = await crypto.randomBytes(20);
    const token = buf.toString("hex");
    const filename = `${token}.pdf`;
    const image = images[i];
    const pngImage = fs.readFileSync(image);
    const instance = await load({ document: pngImage });
    const buffer = await instance.exportPDF();
    const newpdfPath = path.join(uploadDir, filename);
    paths.push(newpdfPath);
    fs.writeFileSync(newpdfPath, Buffer.from(buffer));
    instance.close();
  }
  return paths;
}

export async function mergePDF(files) {

  const merger = new PDFMerger();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (fs.existsSync(file)) {
      await merger.add(file);
    }
  }

  return await merger.saveAsBuffer();
}

export function replaceFile(target, value) {
  return fs.writeFileSync(target, value);
}

async function createBrowser() {
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // headless: 'new',
    headless: true,
    protocolTimeout: 60000,
  }); // Launch the browser
}

export async function generatePDF({
  account,
  table,
  id,
  filename,
  data,
  bodyTemplate,
  landscape = false,
  header = false,
  footer = false,
  format = "letter",
  scale = 1,
  width = null,
  height = null,
  margin = {
    top: "180px",
    bottom: "100px",
    right: "0",
    left: "0",
  },
}) {
  const opts = {
    destination: null,
    filename: `${filename}.pdf`,
    headerTemplate: "<div></div>",
    footerTemplate: "<div></div>",
  };

  if (!browser) {
    await createBrowser(); // If browser is not already created, create a new instance
  }

  const page = await browser.newPage(); // Create a new page within the existing browser instance

  await page.setContent(bodyTemplate);

  if (id) {
    createFolders(uploadDir, [account.domain, table, id]);
    opts.destination = `${uploadDir}/${account.domain}/${table}/${id}/${opts.filename}`;
  } else {
    opts.destination = `${uploadDir}/tmp/${opts.filename}`;
  }

  if (header) {
    const headerFile = path.join(
      path.resolve(),
      `views/template/pdf/${header}/header.ejs`
    );
    if (fs.existsSync(headerFile)) {
      opts.headerTemplate = await ejs.renderFile(headerFile, {
        data: {
          ...data,
          account,
        },
      });
    }
  }

  if (footer) {
    const footerFile = path.join(
      path.resolve(),
      `views/template/pdf/${footer}/footer.ejs`
    );
    if (fs.existsSync(footerFile)) {
      opts.footerTemplate = await ejs.renderFile(footerFile, {
        data: {
          ...data,
          account,
        },
      });
    }
  }

  const options = {
    path: opts.destination,
    scale,
    displayHeaderFooter: true,
    printBackground: true,
    omitBackground: true,
    margin,
    headerTemplate: opts.headerTemplate,
    footerTemplate: opts.footerTemplate,
    landscape,
  };

  if (width || height) {
    if (width) {
      options.width = width;
    }
    if (height) {
      options.height = height;
    }
  } else {
    options.format = format;
  }

  await page.pdf(options); // Generate the PDF

  await page.close(); // Close the page to be reused

  return publicPath({
    account,
    table,
    id,
    filename: opts.filename,
  });
  // The browser instance is not closed here; it will be reused for the next PDF generation
}

export async function generatePDFWithPdfmake({
  account,
  table,
  id,
  filename,
  docDefinition,
  fonts = null,
  outputPath = null,
}) {
  const defaultFonts = fonts || {
    Roboto: {
      normal: path.resolve("fonts/noway-regular-webfont.ttf"),
      bold: path.resolve("fonts/noway-regular-webfont.ttf"),
      italics: path.resolve("fonts/noway-regular-webfont.ttf"),
      bolditalics: path.resolve("fonts/noway-regular-webfont.ttf"),
    },
  };

  const printer = new PdfPrinter(defaultFonts);

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  const pdfFilename = `${filename}.pdf`;

  let pdfFolder;
  if (outputPath) {
    pdfFolder = path.dirname(outputPath);
  } else if (id) {
    pdfFolder = path.join(process.cwd(), "privated", "uploads", account.domain, table, id.toString());
  } else {
    pdfFolder = path.join(process.cwd(), "privated", "uploads", "tmp");
  }

  if (!fs.existsSync(pdfFolder)) {
    await fs.promises.mkdir(pdfFolder, { recursive: true });
  }

  const pdfPath = outputPath || path.join(pdfFolder, pdfFilename);

  const writeStream = fs.createWriteStream(pdfPath);

  pdfDoc.pipe(writeStream);

  pdfDoc.end();

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return publicPath({
    account,
    table,
    id,
    filename: pdfFilename,
  });
}

export async function getFinalMapUrl(shortUrl) {

  if (!browser) {
    await createBrowser(); // If browser is not already created, create a new instance
  }

  const page = await browser.newPage();

  await page.goto(shortUrl, { waitUntil: 'networkidle2' });

  const finalUrl = page.url(); // This is the final redirect

  await browser.close();
  return finalUrl;
}

export function extractMapInfo(url) {
  const decodedUrl = decodeURIComponent(url);

  // 1. Extract the place name
  const nameMatch = decodedUrl.match(/maps\/place\/([^\/@]+)/);
  const placeName = nameMatch ? nameMatch[1].replace(/\+/g, ' ') : null;

  // 2. Extract coordinates from the @ section
  const coordsMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const lat = coordsMatch ? parseFloat(coordsMatch[1]) : null;
  const lng = coordsMatch ? parseFloat(coordsMatch[2]) : null;

  return {
    placeName,
    lat,
    lng
  };
}