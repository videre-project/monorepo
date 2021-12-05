const Root = (_, res) =>
  res.status(400).json({
    details:
      "No data is returned at this path. For more information about this API's published methods and objects, see https://videreproject.com/docs/api.",
  });

export default Root;
