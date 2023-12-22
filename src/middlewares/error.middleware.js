import EErrors from "../services/errors/enums.js";

export default (error, req, res, next) => {
  console.log(error.cause);
  switch (error.code) {
    case EErrors.INVALID_TYPES_ERROR:
      res.status(400).json({ status: "error", error: error.name });
      break;
    case EErrors.INVALID_PRODUCT:
    case EErrors.INVALID_CART:
      res.status(404).json({ status: "error", error: error.name });
      break;
    default:
      res.status(500).json({ status: "error", error: "Unhandled error" });
      break;
  }
};
