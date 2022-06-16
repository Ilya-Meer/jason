export default class Jason {
  constructor() {
    this.output = null;
    this.current = 0;
    this.start = 0;
    this.count = 0;

    this.hasError = false;
  }

  parse(input) {
    this.input = input;

    return this.parseValue();
  }

  parseValue() {
    this.discardWhitespace();

    this.start = this.current;

    const char = this.advance();

    switch (char) {
      case '"':
        return this.parseString();
      case "[":
        return this.parseArray();
      case "{":
        return this.parseObject();
      case " ":
      case "\r":
      case "\t":
      case "\n":
        this.discardWhitespace();
        break;
      default:
        if (this.isAlpha(char)) {
          return this.parseLiteral();
        }

        if (this.isDigit(char)) {
          return this.parseNumber();
        }

        this.reportError(`Unexpected character '${this.peek()}'`);
    }
  }

  advance() {
    const char = this.input[this.current];

    this.current++;

    return char;
  }

  peek() {
    return this.input[this.current];
  }

  peekNext() {
    if (this.current > this.input.length) {
      return "EOF";
    }

    return this.input[this.current + 1];
  }

  parseObject() {
    let isFirstValue = true;

    const obj = {};

    while (this.peek() !== "}" && !this.isEndOfInput()) {
      if (!isFirstValue) {
        this.parseComma();
      }

      const key = this.parseValue();
      this.parseColon();
      const value = this.parseValue();

      obj[key] = value;

      isFirstValue = false;

      this.discardWhitespace();
    }

    return obj;
  }

  parseArray() {
    let isFirstValue = true;

    const arr = [];

    while (this.peek() !== "]" && !this.isEndOfInput()) {
      if (!isFirstValue) {
        this.parseComma();
      }

      arr.push(this.parseValue());

      isFirstValue = false;

      this.discardWhitespace();
    }

    this.advance();

    return arr;
  }

  parseString() {
    while (this.peek() !== '"' && !this.isEndOfInput()) {
      this.advance();
    }

    this.advance();

    return this.input.substring(this.start + 1, this.current - 1);
  }

  parseLiteral() {
    while (this.isAlpha(this.peek()) && !this.isEndOfInput()) {
      this.advance();
    }

    return this.input.substring(this.start, this.current);
  }

  parseNumber() {
    while (this.isDigit(this.peek()) && !this.isEndOfInput()) {
      this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek()) && !this.isEndOfInput()) {
        this.advance();
      }
    }

    return this.input.substring(this.start, this.current);
  }

  parseComma() {
    const char = this.peek();

    if (char !== ",") {
      this.reportError(`expected ',' but got '${char}' instead`);
    }

    this.advance();
  }

  parseColon() {
    const char = this.peek();

    if (char !== ":") {
      this.reportError(`expected ':' but got '${char}' instead`);
    }

    this.advance();
  }

  discardWhitespace() {
    while (this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  isEndOfInput() {
    return this.current > this.input.length;
  }

  isAlpha(c) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  }

  isDigit(c) {
    return Number.isInteger(c) && c >= 0 && c <= 9;
  }

  isWhitespace(c) {
    return c === " " || c === "\n" || c === "\t";
  }

  reportError(error) {
    const contextBeginning = Math.min(50, this.current);

    const context = this.input
      .slice(this.current - contextBeginning, this.current)
      .replaceAll(/\s*/g, "");

    const padding = " ".repeat(context.length);

    const marker = `${padding}^^^`;
    const message = `${padding}${error} at position ${this.current}`;

    throw new Error(`\n\n${context}\n${marker}\n${message}\n\n`);
  }
}
