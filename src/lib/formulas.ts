export const FORMULAS = [
  {
    group: "algebra",
    items: [
      { id: "linear", name: "Линейное уравнение", latex: "ax + b = 0 \\Rightarrow x = -\\dfrac{b}{a}", note: "a ≠ 0" },
      { id: "quad", name: "Квадратное уравнение", latex: "ax^2 + bx + c = 0", note: "a ≠ 0" },
      { id: "disc", name: "Дискриминант", latex: "D = b^2 - 4ac", note: "число корней зависит от знака D" },
      { id: "roots", name: "Формула корней", latex: "x_{1,2} = \\dfrac{-b \\pm \\sqrt{D}}{2a}", note: "при D ≥ 0" },
      { id: "viet", name: "Теорема Виета", latex: "x_1 + x_2 = -\\dfrac{b}{a},\\quad x_1 x_2 = \\dfrac{c}{a}", note: "для приведённого уравнения" },
      { id: "pct", name: "Проценты", latex: "p\\% \\text{ от } n = \\dfrac{p}{100}\\cdot n", note: "базовая доля" },
    ],
  },
  {
    group: "geometry",
    items: [
      { id: "pyth", name: "Пифагор", latex: "a^2 + b^2 = c^2", note: "прямоугольный треугольник" },
      { id: "area-tri", name: "Площадь треугольника", latex: "S = \\dfrac{1}{2}ah", note: "a — основание" },
      { id: "circ", name: "Окружность", latex: "C = 2\\pi r,\\quad S = \\pi r^2", note: "радиус r" },
    ],
  },
  {
    group: "physics",
    items: [
      { id: "ohm", name: "Закон Ома", latex: "I = \\dfrac{U}{R}", note: "участок цепи" },
      { id: "newton", name: "Второй закон Ньютона", latex: "F = ma", note: "равнодействующая сила" },
      { id: "kin", name: "Путь при равноускорении", latex: "s = v_0 t + \\dfrac{at^2}{2}", note: "прямолинейное движение" },
      { id: "power", name: "Мощность", latex: "P = UI = I^2 R", note: "постоянный ток" },
    ],
  },
  {
    group: "chemistry",
    items: [
      { id: "mole", name: "Количество вещества", latex: "n = \\dfrac{m}{M}", note: "моль" },
      { id: "conc", name: "Молярная концентрация", latex: "c = \\dfrac{n}{V}", note: "моль/л" },
    ],
  },
];
