import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { NODEMAILER_PASS, NODEMAILER_USER } from "../../config/config.js";
import { devLogger } from "../../utils/logger.js";
import moment from "moment";

export const sendEmailPurchase = async (userEmail, ticket) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Ecommerce",
      link: "http://localhost:8080",
    },
  });

  let productsData = ticket.products.map((prod) => ({
    item: prod.product.title,
    quantity: prod.quantity,
    price: `$${prod.product.price}`,
  }));

  let content = {
    body: {
      name: ticket.purchaser,
      intro: "Your order has been processed successfully",
      dictionary: {
        date: moment(ticket.purchase_datetime).format("DD/MM/YYYY HH:mm:ss"),
      },
      table: {
        data: productsData,
        columns: {
          // Optionally, customize the column widths
          customWidth: {
            item: "70%",
            price: "30%",
          },
          // Optionally, change column text alignment
          customAlignment: {
            item: "left",
            price: "right",
          },
        },
      },
      outro: `Total: $${ticket.amount}`,
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: userEmail,
    subject: "Thanks for your purchase",
    html: mail,
  };
  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};

export const sendEmailRegister = async (userEmail) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Ecommerce",
      link: "http://localhost:8080",
    },
  });

  let content = {
    body: {
      name: userEmail.full_name,
      intro: `Welcome! Your registration has been successfully processed as ${userEmail.email}`,
      outro: `Now you can browse the app to see our products and carry out the purchase processes as a ${userEmail.role}`,
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: userEmail.email,
    subject: "Thanks for subscribing",
    html: mail,
  };
  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};

export const emailResetPassword = async (userEmail, tokenLink) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };
  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Ecommerce",
      link: "http://localhost:8080",
    },
  });

  let content = {
    body: {
      name: `${userEmail.full_name}`,
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset your password",
          link: `http://localhost:8080/api/jwt/passwordReset/${tokenLink}`,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: userEmail.email,
    subject: "Password recovery email",
    html: mail,
  };
  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};

export const sendAccountDeletedEmail = async (userEmail) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Ecommerce",
      link: "http://localhost:8080",
    },
  });

  let content = {
    body: {
      name: userEmail.full_name,
      intro: `We're sorry to inform you that your account at ${userEmail.email} has been deleted due to inactivity.`,
      outro: `If you believe this is an error or want to reactivate your account, please contact our support team.`,
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: userEmail.email,
    subject: "Account Deletion Due to Inactivity",
    html: mail,
  };

  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};

export const sendingEmailDeletedProduct = async (user, product) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Ecommerce",
      link: "http://localhost:8080",
    },
  });

  let content = {
    body: {
      name: `${user.first_name} ${user.last_name}`,
      intro: `We're sorry to inform you that your product "${product.title}", code "${product.code}" has been deleted.`,
      outro: `If you have any questions or concerns, please feel free to contact our support team.`,
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: user.email,
    subject: `Notification: Product Deleted`,
    html: mail,
  };

  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};
