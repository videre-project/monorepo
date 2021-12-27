import { createCanvas, loadImage } from 'canvas';
const companion_image = __dirname.replace('src/utils/magic', 'bin/Companion Frame.png');

/**
 * Draw visual decklist from decklist object.
 * 
 * @example drawdeck({ mainboard: [{ qty: 4, name: "Island", image: "https://c1.scryfall...", ... }, ...], sideboard: [...] })
 * 
 */
export const drawDeck = async (decklist, flex_width = 7, override_width, show_quantities = true) => {
  const mainboardArray = decklist.filter(card => !(card.display_type == 'Companion' || card.display_type == 'Sideboard'));
  const sideboardArray = decklist.filter(card => (card.display_type == 'Companion' || card.display_type == 'Sideboard'));

  const mainboard_length = override_width ? flex_width : mainboardArray.length

  const numCols = mainboardArray.length >= flex_width ? flex_width : mainboard_length;
  const numRows = Math.ceil(mainboardArray.length / flex_width);

  const width = (
    // Horizontal padding
    (50 * 2) +
    // Total width of cards
    ((numCols + Math.ceil(sideboardArray.length / numRows)) * 223) +
    // Total gutter between cards
    (((numCols - 1) + (sideboardArray.length ? (Math.ceil(sideboardArray.length / numRows) - 1) : 0)) * 20)
    // Gutter between mainboard and sideboard
    + (sideboardArray.length ? 100 : 0)
  );

  const height = (
    // Vertical padding
    (50 * 2) +
    // Total height of cards
    (numRows * 311) +
    // Total gutter between cards
    ((numRows - 1) * 25)
  );

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d', { alpha: false });

  // Speed optimizations
  context.quality = 'fast';
  context.textDrawingMode = 'glyph';

  // Background
  context.fillStyle = '#292B2F';//'#2F3136';
  context.fillRect(0, 0, width, height);

  // Fills rectangle with rounded corners.
  const roundRect = (context, x, y, w, h, r) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    context.beginPath();
    context.moveTo(x+r, y);
    context.arcTo(x+w, y,   x+w, y+h, r);
    context.arcTo(x+w, y+h, x,   y+h, r);
    context.arcTo(x,   y+h, x,   y,   r);
    context.arcTo(x,   y,   x+w, y,   r);
    context.closePath();
    context.fillStyle = '#1E1E1E';
    context.fill();
  }

  // Draw mainboard and sideboard image grid with qty labels
  await Promise.all(
    [...mainboardArray, ...sideboardArray]
      .map(async (card, i) => {
        const _i = (i > mainboardArray.length - 1)
          ? i - mainboardArray.length
          : i;
        const _numCols = (i > mainboardArray.length - 1)
          ? Math.ceil(sideboardArray.length / numRows)
          : flex_width;
        const _mainboardWidth = (numCols * 223) + ((numCols - 1) * 20);

        let x_offset = 50 + ((_i % _numCols) * 223) + (((_i % _numCols) > 0)
          ? ((_i % _numCols) * 20)
          : (0));
        const y_offset = 50 + (Math.floor(_i / _numCols) * 331) + 5;// (Math.floor(i / 7) * 25);
        if (i > mainboardArray.length - 1) x_offset += 100 + _mainboardWidth;

        const cardImage = await loadImage(card.image);
        context.drawImage(cardImage, x_offset, y_offset, 223, 311);
        if (card.display_type == 'Companion') {
          const _cardImage = await loadImage(companion_image);
          context.drawImage(_cardImage, x_offset, y_offset, 223, 311);
        }

        if (show_quantities) {
          const text = !isNaN(card.qty)
            ? `×${ card.qty }`
            : card.qty;
          if (isNaN(card.qty)) x_offset = x_offset - 5;
          let font_offset = 5 + (text.length > 2 ? (text.length - 2) * 17 : 0);
          if (isNaN(card.qty)) font_offset = font_offset + 10;
          roundRect(context, x_offset + 150 - font_offset, y_offset + 41, 50 + font_offset, 50, 8);
          context.fillStyle = '#FFFFFF';
          context.font = 'bold 25px Verdana';
          context.fillText(text, x_offset + 156 - font_offset, y_offset + 74);
        }
      })
  );
  
  const buffer = canvas.toBuffer('image/png');

  const max_dim = 1080 * 2;
  if (width > max_dim || height > max_dim) {
    const _width = width > max_dim
      ? max_dim
      : width / (height / max_dim);
    let _height = height > max_dim
      ? max_dim
      : height / (width / max_dim);
    if (width > max_dim && height > max_dim) _height = height / (width / max_dim);

    const _canvas = createCanvas(_width, _height);
    const _context = _canvas.getContext('2d', { alpha: false });

    // Draw background.
    _context.fillStyle = '#2F3136';
    _context.fillRect(0, 0, _width, _height);

    const image = await loadImage(buffer);
    _context.drawImage(image, 0, 0, _width, _height);

    return _canvas.toBuffer('image/png');
  }

  return buffer;
}