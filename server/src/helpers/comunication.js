import axios from "axios";

export async function postMark(data) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.postmarkapp.com/email",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_API,
      },
      data,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw {
      code: error?.code || null,
      err: error?.response?.body || null,
      msg: "Email no pudo ser enviado",
    };
  }
}

export async function postMarkTemplate(data) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.postmarkapp.com/email/withTemplate",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_API,
      },
      data,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw {
      code: error?.code || null,
      err: error?.response?.body || null,
      msg: "Email no pudo ser enviado",
    };
  }
}


export async function postMarkErrors(data) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.postmarkapp.com/email",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_SAONAS_API,
      },
      data,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw {
      code: error?.code || null,
      err: error?.response?.body || null,
      msg: "Email no pudo ser enviado",
    };
  }
}