export type List<Data> = {
  next?: List<Data>
  data: Data
}
