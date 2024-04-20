declare module 'rbush-knn' {
  import RBush from 'rbush'
  export default function knn<T>(
    tree: RBush<T>,
    x: number,
    y: number,
    n: number,
  ): T[]
}
