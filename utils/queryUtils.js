exports.regexSearch = (str) => {
  return {
    $regex: str,
    $options: 'i',
  };
};

exports.sort = (field) => {
  let sort = {};
  if (field.startsWith('-')) {
    const sortBy = field.split('-');
    sort[sortBy[1]] = -1;
  } else {
    sort[field] = 1;
  }
  return sort;
};

exports.paginate = (p, l) => {
  const page = p * 1;
  const limit = l * 1;
  const skip = (page - 1) * limit;
  return [{ $skip: skip }, { $limit: limit }];
};
