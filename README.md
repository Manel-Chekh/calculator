# Interactive Calculator

Calculator built with vanilla HTML, CSS and JavaScript (no framework, no eval).

## Features
- Mouse and keyboard support (0-9 . + - * / Enter Backspace Esc)
- Correct operator precedence (2+3*4 = 14)
- Unary minus (-2*-3 = 6)
- Live result preview
- Error handling (division by zero, invalid input)

## How it works
A small recursive-descent parser (expression -> term -> factor) evaluates the input safely instead of eval().

## Run
Open index.html in a browser.