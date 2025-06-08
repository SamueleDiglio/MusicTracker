declare module 'jsonp' {
  function jsonp(url: string, options: { name?: string }, callback: (err: Error | null, data: any) => void): void;
  export = jsonp;
}
