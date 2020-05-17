class CabalBot {
  constructor(name, opts) {
    this.name = name
    this.symbol = opts.symbol ?? "!"
    if(this.symbol.length == 1) {
      throw "symbol can't be longer than one character"
    }
    this.channels = opts.channels
  }
}