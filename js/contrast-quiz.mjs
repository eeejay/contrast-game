const colorNameList = await fetch("https://unpkg.com/color-name-list@10.24.0/dist/colornames.json").then((response) => response.json());

const RED = 0.2126;
const GREEN = 0.7152;
const BLUE = 0.0722;

const GAMMA = 2.4;

function luminance(r, g, b) {
  let a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, GAMMA);
  });
  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

function calcContrast(rgb1, rgb2) {
  let lum1 = luminance(...rgb1);
  let lum2 = luminance(...rgb2);
  let brightest = Math.max(lum1, lum2);
  let darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result.slice(1, 4).map(r => parseInt(r, 16));
}

function randomColor() {
  let color = colorNameList[Math.floor(Math.random() * colorNameList.length)];
  return { name: color.name, rgb: hexToRgb(color.hex) };
}

class QuizCard {
  constructor(bgColor, fgColor, timeToSolve = 15) {
    this.bgColor = bgColor;
    this.fgColor = fgColor;
    this.timeToSolve = 15;
    this.contrast = calcContrast(bgColor.rgb, fgColor.rgb);
  }

  get cssBgColor() {
    return `rgb(${this.bgColor.rgb.join(',')})`
  }

  get cssFgColor() {
    return `rgb(${this.fgColor.rgb.join(',')})`
  }

  get bgColorName() {
    return this.bgColor.name;
  }

  get fgColorName() {
    return this.fgColor.name;
  }

  get contrastRating() {
    if (this.contrast >= 7) {
      return "AAA";
    }

    if (this.contrast >= 4.5) {
      return "AA";
    }

    return "FAIL";
  }

  get timerDuration() {
    return this.timeToSolve * 1000;
  }
}

const DEFAULT_PARAMETERS = { timeToSolve: 3, prereq: () => true };
const QUIZ_PARAMETERS = [
  { timeToSolve: 15, prereq: () => true },
  { timeToSolve: 15, prereq: () => true },
  { timeToSolve: 15, prereq: () => true },
  { timeToSolve: 15, prereq: () => true },
  { timeToSolve: 15, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 10, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true },
  { timeToSolve: 5, prereq: () => true }
];

function* QuizGenerator() {
  let quizNumber = 0;
  while (true) {
    const contrastRating = ["AAA", "AA", "FAIL"][Math.floor(Math.random() * 3)];
    const quizParams = QUIZ_PARAMETERS[quizNumber] || DEFAULT_PARAMETERS;
    while (true) {
      let quizCard = new QuizCard(randomColor(), randomColor(), quizParams.timeToSolve);
      if (quizCard.contrastRating == contrastRating && quizParams.prereq(quizCard)) {
        yield quizCard;
        quizNumber++;
        break;
      }
    }
  }
}

export { QuizGenerator };