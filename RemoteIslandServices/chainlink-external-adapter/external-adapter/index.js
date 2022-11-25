exports.getPackedData = (req, res) => {
  const data = {
    jobRunID: req.body.id,
    data: pack64(1000, 9, 15743656147, 15743656147),
    statusCode: 200
  }
  res.status(200).send(data)
}

function repeat(str, num) {
  if (str.length === 0 || num <= 1) {
    if (num === 1) {
      return str;
    }

    return '';
  }

  let result = '';
  let pattern = str;

  while (num > 0) {
    if (num & 1) {
      result += pattern;
    }

    num >>=  1;
    pattern += pattern;
  }

  return result;
}

function lpad(obj, str, num) {
  return repeat(str, num - obj.length) + obj;
}

pack64 = (a, b, c, d) => {
  const length = 64;
  const string = [a, b, c, d].map(e => lpad(e.toString(2), "0", length)).join('')

  return Array.from({length: string.length/8}, (v, i) => {
    const from = i * 8
    const to = from + 8
    const bin = string.slice(from, to)
    const hex = parseInt(bin, 2).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}
