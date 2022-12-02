
export type EnumMap<T> = { [key in string]: T };

export interface EntityOptions {
  length?: number[],
  mask?: RegExp
}

export  interface EntityNumberOptions extends EntityOptions {
  numbersNotAvailable?: number[]
}

export  type Optional<Options> = Options & { defaultValue: any }

export type EntityLayer<Props> = Props & {

}