//get all request

export const getstudents = async (req, res) => {
  const students = await [
    {
      id: 1,
      name: "Rushu",
      age: 21,
    },
    {
      id: 2,
      name: "Rohan",
      age: 22,
    },
  ];
  res.status(200).json(students, {
    message: " all student get successfully",
  });
};
