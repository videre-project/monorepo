const NotFound = (_, res) =>
  res.status(404).json({
    details:
      "The requested method does not exist. For more information about this API's published methods and objects, see https://videreproject.com/docs/api.",
  });

export default NotFound;
