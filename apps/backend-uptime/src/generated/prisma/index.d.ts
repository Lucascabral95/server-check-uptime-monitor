
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Monitor
 * 
 */
export type Monitor = $Result.DefaultSelection<Prisma.$MonitorPayload>
/**
 * Model PingLog
 * 
 */
export type PingLog = $Result.DefaultSelection<Prisma.$PingLogPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.monitor`: Exposes CRUD operations for the **Monitor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Monitors
    * const monitors = await prisma.monitor.findMany()
    * ```
    */
  get monitor(): Prisma.MonitorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pingLog`: Exposes CRUD operations for the **PingLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PingLogs
    * const pingLogs = await prisma.pingLog.findMany()
    * ```
    */
  get pingLog(): Prisma.PingLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Monitor: 'Monitor',
    PingLog: 'PingLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "monitor" | "pingLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Monitor: {
        payload: Prisma.$MonitorPayload<ExtArgs>
        fields: Prisma.MonitorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MonitorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MonitorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>
          }
          findFirst: {
            args: Prisma.MonitorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MonitorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>
          }
          findMany: {
            args: Prisma.MonitorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>[]
          }
          create: {
            args: Prisma.MonitorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>
          }
          createMany: {
            args: Prisma.MonitorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MonitorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>[]
          }
          delete: {
            args: Prisma.MonitorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>
          }
          update: {
            args: Prisma.MonitorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>
          }
          deleteMany: {
            args: Prisma.MonitorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MonitorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MonitorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>[]
          }
          upsert: {
            args: Prisma.MonitorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonitorPayload>
          }
          aggregate: {
            args: Prisma.MonitorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMonitor>
          }
          groupBy: {
            args: Prisma.MonitorGroupByArgs<ExtArgs>
            result: $Utils.Optional<MonitorGroupByOutputType>[]
          }
          count: {
            args: Prisma.MonitorCountArgs<ExtArgs>
            result: $Utils.Optional<MonitorCountAggregateOutputType> | number
          }
        }
      }
      PingLog: {
        payload: Prisma.$PingLogPayload<ExtArgs>
        fields: Prisma.PingLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PingLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PingLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>
          }
          findFirst: {
            args: Prisma.PingLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PingLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>
          }
          findMany: {
            args: Prisma.PingLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>[]
          }
          create: {
            args: Prisma.PingLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>
          }
          createMany: {
            args: Prisma.PingLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PingLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>[]
          }
          delete: {
            args: Prisma.PingLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>
          }
          update: {
            args: Prisma.PingLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>
          }
          deleteMany: {
            args: Prisma.PingLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PingLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PingLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>[]
          }
          upsert: {
            args: Prisma.PingLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PingLogPayload>
          }
          aggregate: {
            args: Prisma.PingLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePingLog>
          }
          groupBy: {
            args: Prisma.PingLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<PingLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.PingLogCountArgs<ExtArgs>
            result: $Utils.Optional<PingLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    monitor?: MonitorOmit
    pingLog?: PingLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    monitors: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    monitors?: boolean | UserCountOutputTypeCountMonitorsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMonitorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MonitorWhereInput
  }


  /**
   * Count Type MonitorCountOutputType
   */

  export type MonitorCountOutputType = {
    logs: number
  }

  export type MonitorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    logs?: boolean | MonitorCountOutputTypeCountLogsArgs
  }

  // Custom InputTypes
  /**
   * MonitorCountOutputType without action
   */
  export type MonitorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonitorCountOutputType
     */
    select?: MonitorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MonitorCountOutputType without action
   */
  export type MonitorCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PingLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    monitors?: boolean | User$monitorsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "createdAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    monitors?: boolean | User$monitorsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      monitors: Prisma.$MonitorPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    monitors<T extends User$monitorsArgs<ExtArgs> = {}>(args?: Subset<T, User$monitorsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.monitors
   */
  export type User$monitorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    where?: MonitorWhereInput
    orderBy?: MonitorOrderByWithRelationInput | MonitorOrderByWithRelationInput[]
    cursor?: MonitorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MonitorScalarFieldEnum | MonitorScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Monitor
   */

  export type AggregateMonitor = {
    _count: MonitorCountAggregateOutputType | null
    _avg: MonitorAvgAggregateOutputType | null
    _sum: MonitorSumAggregateOutputType | null
    _min: MonitorMinAggregateOutputType | null
    _max: MonitorMaxAggregateOutputType | null
  }

  export type MonitorAvgAggregateOutputType = {
    frequency: number | null
  }

  export type MonitorSumAggregateOutputType = {
    frequency: number | null
  }

  export type MonitorMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    url: string | null
    frequency: number | null
    isActive: boolean | null
    nextCheck: Date | null
    status: string | null
    lastCheck: Date | null
    createdAt: Date | null
  }

  export type MonitorMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    url: string | null
    frequency: number | null
    isActive: boolean | null
    nextCheck: Date | null
    status: string | null
    lastCheck: Date | null
    createdAt: Date | null
  }

  export type MonitorCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    url: number
    frequency: number
    isActive: number
    nextCheck: number
    status: number
    lastCheck: number
    createdAt: number
    _all: number
  }


  export type MonitorAvgAggregateInputType = {
    frequency?: true
  }

  export type MonitorSumAggregateInputType = {
    frequency?: true
  }

  export type MonitorMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    url?: true
    frequency?: true
    isActive?: true
    nextCheck?: true
    status?: true
    lastCheck?: true
    createdAt?: true
  }

  export type MonitorMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    url?: true
    frequency?: true
    isActive?: true
    nextCheck?: true
    status?: true
    lastCheck?: true
    createdAt?: true
  }

  export type MonitorCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    url?: true
    frequency?: true
    isActive?: true
    nextCheck?: true
    status?: true
    lastCheck?: true
    createdAt?: true
    _all?: true
  }

  export type MonitorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Monitor to aggregate.
     */
    where?: MonitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Monitors to fetch.
     */
    orderBy?: MonitorOrderByWithRelationInput | MonitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MonitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Monitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Monitors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Monitors
    **/
    _count?: true | MonitorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MonitorAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MonitorSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MonitorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MonitorMaxAggregateInputType
  }

  export type GetMonitorAggregateType<T extends MonitorAggregateArgs> = {
        [P in keyof T & keyof AggregateMonitor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMonitor[P]>
      : GetScalarType<T[P], AggregateMonitor[P]>
  }




  export type MonitorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MonitorWhereInput
    orderBy?: MonitorOrderByWithAggregationInput | MonitorOrderByWithAggregationInput[]
    by: MonitorScalarFieldEnum[] | MonitorScalarFieldEnum
    having?: MonitorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MonitorCountAggregateInputType | true
    _avg?: MonitorAvgAggregateInputType
    _sum?: MonitorSumAggregateInputType
    _min?: MonitorMinAggregateInputType
    _max?: MonitorMaxAggregateInputType
  }

  export type MonitorGroupByOutputType = {
    id: string
    userId: string
    name: string
    url: string
    frequency: number
    isActive: boolean
    nextCheck: Date
    status: string
    lastCheck: Date | null
    createdAt: Date
    _count: MonitorCountAggregateOutputType | null
    _avg: MonitorAvgAggregateOutputType | null
    _sum: MonitorSumAggregateOutputType | null
    _min: MonitorMinAggregateOutputType | null
    _max: MonitorMaxAggregateOutputType | null
  }

  type GetMonitorGroupByPayload<T extends MonitorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MonitorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MonitorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MonitorGroupByOutputType[P]>
            : GetScalarType<T[P], MonitorGroupByOutputType[P]>
        }
      >
    >


  export type MonitorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    url?: boolean
    frequency?: boolean
    isActive?: boolean
    nextCheck?: boolean
    status?: boolean
    lastCheck?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    logs?: boolean | Monitor$logsArgs<ExtArgs>
    _count?: boolean | MonitorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["monitor"]>

  export type MonitorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    url?: boolean
    frequency?: boolean
    isActive?: boolean
    nextCheck?: boolean
    status?: boolean
    lastCheck?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["monitor"]>

  export type MonitorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    url?: boolean
    frequency?: boolean
    isActive?: boolean
    nextCheck?: boolean
    status?: boolean
    lastCheck?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["monitor"]>

  export type MonitorSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    url?: boolean
    frequency?: boolean
    isActive?: boolean
    nextCheck?: boolean
    status?: boolean
    lastCheck?: boolean
    createdAt?: boolean
  }

  export type MonitorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "url" | "frequency" | "isActive" | "nextCheck" | "status" | "lastCheck" | "createdAt", ExtArgs["result"]["monitor"]>
  export type MonitorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    logs?: boolean | Monitor$logsArgs<ExtArgs>
    _count?: boolean | MonitorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MonitorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MonitorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MonitorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Monitor"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      logs: Prisma.$PingLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      url: string
      frequency: number
      isActive: boolean
      nextCheck: Date
      status: string
      lastCheck: Date | null
      createdAt: Date
    }, ExtArgs["result"]["monitor"]>
    composites: {}
  }

  type MonitorGetPayload<S extends boolean | null | undefined | MonitorDefaultArgs> = $Result.GetResult<Prisma.$MonitorPayload, S>

  type MonitorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MonitorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MonitorCountAggregateInputType | true
    }

  export interface MonitorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Monitor'], meta: { name: 'Monitor' } }
    /**
     * Find zero or one Monitor that matches the filter.
     * @param {MonitorFindUniqueArgs} args - Arguments to find a Monitor
     * @example
     * // Get one Monitor
     * const monitor = await prisma.monitor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MonitorFindUniqueArgs>(args: SelectSubset<T, MonitorFindUniqueArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Monitor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MonitorFindUniqueOrThrowArgs} args - Arguments to find a Monitor
     * @example
     * // Get one Monitor
     * const monitor = await prisma.monitor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MonitorFindUniqueOrThrowArgs>(args: SelectSubset<T, MonitorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Monitor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorFindFirstArgs} args - Arguments to find a Monitor
     * @example
     * // Get one Monitor
     * const monitor = await prisma.monitor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MonitorFindFirstArgs>(args?: SelectSubset<T, MonitorFindFirstArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Monitor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorFindFirstOrThrowArgs} args - Arguments to find a Monitor
     * @example
     * // Get one Monitor
     * const monitor = await prisma.monitor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MonitorFindFirstOrThrowArgs>(args?: SelectSubset<T, MonitorFindFirstOrThrowArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Monitors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Monitors
     * const monitors = await prisma.monitor.findMany()
     * 
     * // Get first 10 Monitors
     * const monitors = await prisma.monitor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const monitorWithIdOnly = await prisma.monitor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MonitorFindManyArgs>(args?: SelectSubset<T, MonitorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Monitor.
     * @param {MonitorCreateArgs} args - Arguments to create a Monitor.
     * @example
     * // Create one Monitor
     * const Monitor = await prisma.monitor.create({
     *   data: {
     *     // ... data to create a Monitor
     *   }
     * })
     * 
     */
    create<T extends MonitorCreateArgs>(args: SelectSubset<T, MonitorCreateArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Monitors.
     * @param {MonitorCreateManyArgs} args - Arguments to create many Monitors.
     * @example
     * // Create many Monitors
     * const monitor = await prisma.monitor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MonitorCreateManyArgs>(args?: SelectSubset<T, MonitorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Monitors and returns the data saved in the database.
     * @param {MonitorCreateManyAndReturnArgs} args - Arguments to create many Monitors.
     * @example
     * // Create many Monitors
     * const monitor = await prisma.monitor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Monitors and only return the `id`
     * const monitorWithIdOnly = await prisma.monitor.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MonitorCreateManyAndReturnArgs>(args?: SelectSubset<T, MonitorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Monitor.
     * @param {MonitorDeleteArgs} args - Arguments to delete one Monitor.
     * @example
     * // Delete one Monitor
     * const Monitor = await prisma.monitor.delete({
     *   where: {
     *     // ... filter to delete one Monitor
     *   }
     * })
     * 
     */
    delete<T extends MonitorDeleteArgs>(args: SelectSubset<T, MonitorDeleteArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Monitor.
     * @param {MonitorUpdateArgs} args - Arguments to update one Monitor.
     * @example
     * // Update one Monitor
     * const monitor = await prisma.monitor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MonitorUpdateArgs>(args: SelectSubset<T, MonitorUpdateArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Monitors.
     * @param {MonitorDeleteManyArgs} args - Arguments to filter Monitors to delete.
     * @example
     * // Delete a few Monitors
     * const { count } = await prisma.monitor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MonitorDeleteManyArgs>(args?: SelectSubset<T, MonitorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Monitors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Monitors
     * const monitor = await prisma.monitor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MonitorUpdateManyArgs>(args: SelectSubset<T, MonitorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Monitors and returns the data updated in the database.
     * @param {MonitorUpdateManyAndReturnArgs} args - Arguments to update many Monitors.
     * @example
     * // Update many Monitors
     * const monitor = await prisma.monitor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Monitors and only return the `id`
     * const monitorWithIdOnly = await prisma.monitor.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MonitorUpdateManyAndReturnArgs>(args: SelectSubset<T, MonitorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Monitor.
     * @param {MonitorUpsertArgs} args - Arguments to update or create a Monitor.
     * @example
     * // Update or create a Monitor
     * const monitor = await prisma.monitor.upsert({
     *   create: {
     *     // ... data to create a Monitor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Monitor we want to update
     *   }
     * })
     */
    upsert<T extends MonitorUpsertArgs>(args: SelectSubset<T, MonitorUpsertArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Monitors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorCountArgs} args - Arguments to filter Monitors to count.
     * @example
     * // Count the number of Monitors
     * const count = await prisma.monitor.count({
     *   where: {
     *     // ... the filter for the Monitors we want to count
     *   }
     * })
    **/
    count<T extends MonitorCountArgs>(
      args?: Subset<T, MonitorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MonitorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Monitor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MonitorAggregateArgs>(args: Subset<T, MonitorAggregateArgs>): Prisma.PrismaPromise<GetMonitorAggregateType<T>>

    /**
     * Group by Monitor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonitorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MonitorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MonitorGroupByArgs['orderBy'] }
        : { orderBy?: MonitorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MonitorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMonitorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Monitor model
   */
  readonly fields: MonitorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Monitor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MonitorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    logs<T extends Monitor$logsArgs<ExtArgs> = {}>(args?: Subset<T, Monitor$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Monitor model
   */
  interface MonitorFieldRefs {
    readonly id: FieldRef<"Monitor", 'String'>
    readonly userId: FieldRef<"Monitor", 'String'>
    readonly name: FieldRef<"Monitor", 'String'>
    readonly url: FieldRef<"Monitor", 'String'>
    readonly frequency: FieldRef<"Monitor", 'Int'>
    readonly isActive: FieldRef<"Monitor", 'Boolean'>
    readonly nextCheck: FieldRef<"Monitor", 'DateTime'>
    readonly status: FieldRef<"Monitor", 'String'>
    readonly lastCheck: FieldRef<"Monitor", 'DateTime'>
    readonly createdAt: FieldRef<"Monitor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Monitor findUnique
   */
  export type MonitorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * Filter, which Monitor to fetch.
     */
    where: MonitorWhereUniqueInput
  }

  /**
   * Monitor findUniqueOrThrow
   */
  export type MonitorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * Filter, which Monitor to fetch.
     */
    where: MonitorWhereUniqueInput
  }

  /**
   * Monitor findFirst
   */
  export type MonitorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * Filter, which Monitor to fetch.
     */
    where?: MonitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Monitors to fetch.
     */
    orderBy?: MonitorOrderByWithRelationInput | MonitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Monitors.
     */
    cursor?: MonitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Monitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Monitors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Monitors.
     */
    distinct?: MonitorScalarFieldEnum | MonitorScalarFieldEnum[]
  }

  /**
   * Monitor findFirstOrThrow
   */
  export type MonitorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * Filter, which Monitor to fetch.
     */
    where?: MonitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Monitors to fetch.
     */
    orderBy?: MonitorOrderByWithRelationInput | MonitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Monitors.
     */
    cursor?: MonitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Monitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Monitors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Monitors.
     */
    distinct?: MonitorScalarFieldEnum | MonitorScalarFieldEnum[]
  }

  /**
   * Monitor findMany
   */
  export type MonitorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * Filter, which Monitors to fetch.
     */
    where?: MonitorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Monitors to fetch.
     */
    orderBy?: MonitorOrderByWithRelationInput | MonitorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Monitors.
     */
    cursor?: MonitorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Monitors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Monitors.
     */
    skip?: number
    distinct?: MonitorScalarFieldEnum | MonitorScalarFieldEnum[]
  }

  /**
   * Monitor create
   */
  export type MonitorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * The data needed to create a Monitor.
     */
    data: XOR<MonitorCreateInput, MonitorUncheckedCreateInput>
  }

  /**
   * Monitor createMany
   */
  export type MonitorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Monitors.
     */
    data: MonitorCreateManyInput | MonitorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Monitor createManyAndReturn
   */
  export type MonitorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * The data used to create many Monitors.
     */
    data: MonitorCreateManyInput | MonitorCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Monitor update
   */
  export type MonitorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * The data needed to update a Monitor.
     */
    data: XOR<MonitorUpdateInput, MonitorUncheckedUpdateInput>
    /**
     * Choose, which Monitor to update.
     */
    where: MonitorWhereUniqueInput
  }

  /**
   * Monitor updateMany
   */
  export type MonitorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Monitors.
     */
    data: XOR<MonitorUpdateManyMutationInput, MonitorUncheckedUpdateManyInput>
    /**
     * Filter which Monitors to update
     */
    where?: MonitorWhereInput
    /**
     * Limit how many Monitors to update.
     */
    limit?: number
  }

  /**
   * Monitor updateManyAndReturn
   */
  export type MonitorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * The data used to update Monitors.
     */
    data: XOR<MonitorUpdateManyMutationInput, MonitorUncheckedUpdateManyInput>
    /**
     * Filter which Monitors to update
     */
    where?: MonitorWhereInput
    /**
     * Limit how many Monitors to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Monitor upsert
   */
  export type MonitorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * The filter to search for the Monitor to update in case it exists.
     */
    where: MonitorWhereUniqueInput
    /**
     * In case the Monitor found by the `where` argument doesn't exist, create a new Monitor with this data.
     */
    create: XOR<MonitorCreateInput, MonitorUncheckedCreateInput>
    /**
     * In case the Monitor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MonitorUpdateInput, MonitorUncheckedUpdateInput>
  }

  /**
   * Monitor delete
   */
  export type MonitorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
    /**
     * Filter which Monitor to delete.
     */
    where: MonitorWhereUniqueInput
  }

  /**
   * Monitor deleteMany
   */
  export type MonitorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Monitors to delete
     */
    where?: MonitorWhereInput
    /**
     * Limit how many Monitors to delete.
     */
    limit?: number
  }

  /**
   * Monitor.logs
   */
  export type Monitor$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    where?: PingLogWhereInput
    orderBy?: PingLogOrderByWithRelationInput | PingLogOrderByWithRelationInput[]
    cursor?: PingLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PingLogScalarFieldEnum | PingLogScalarFieldEnum[]
  }

  /**
   * Monitor without action
   */
  export type MonitorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Monitor
     */
    select?: MonitorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Monitor
     */
    omit?: MonitorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonitorInclude<ExtArgs> | null
  }


  /**
   * Model PingLog
   */

  export type AggregatePingLog = {
    _count: PingLogCountAggregateOutputType | null
    _avg: PingLogAvgAggregateOutputType | null
    _sum: PingLogSumAggregateOutputType | null
    _min: PingLogMinAggregateOutputType | null
    _max: PingLogMaxAggregateOutputType | null
  }

  export type PingLogAvgAggregateOutputType = {
    statusCode: number | null
    durationMs: number | null
  }

  export type PingLogSumAggregateOutputType = {
    statusCode: number | null
    durationMs: number | null
  }

  export type PingLogMinAggregateOutputType = {
    id: string | null
    monitorId: string | null
    statusCode: number | null
    durationMs: number | null
    error: string | null
    timestamp: Date | null
  }

  export type PingLogMaxAggregateOutputType = {
    id: string | null
    monitorId: string | null
    statusCode: number | null
    durationMs: number | null
    error: string | null
    timestamp: Date | null
  }

  export type PingLogCountAggregateOutputType = {
    id: number
    monitorId: number
    statusCode: number
    durationMs: number
    error: number
    timestamp: number
    _all: number
  }


  export type PingLogAvgAggregateInputType = {
    statusCode?: true
    durationMs?: true
  }

  export type PingLogSumAggregateInputType = {
    statusCode?: true
    durationMs?: true
  }

  export type PingLogMinAggregateInputType = {
    id?: true
    monitorId?: true
    statusCode?: true
    durationMs?: true
    error?: true
    timestamp?: true
  }

  export type PingLogMaxAggregateInputType = {
    id?: true
    monitorId?: true
    statusCode?: true
    durationMs?: true
    error?: true
    timestamp?: true
  }

  export type PingLogCountAggregateInputType = {
    id?: true
    monitorId?: true
    statusCode?: true
    durationMs?: true
    error?: true
    timestamp?: true
    _all?: true
  }

  export type PingLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PingLog to aggregate.
     */
    where?: PingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PingLogs to fetch.
     */
    orderBy?: PingLogOrderByWithRelationInput | PingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PingLogs
    **/
    _count?: true | PingLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PingLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PingLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PingLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PingLogMaxAggregateInputType
  }

  export type GetPingLogAggregateType<T extends PingLogAggregateArgs> = {
        [P in keyof T & keyof AggregatePingLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePingLog[P]>
      : GetScalarType<T[P], AggregatePingLog[P]>
  }




  export type PingLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PingLogWhereInput
    orderBy?: PingLogOrderByWithAggregationInput | PingLogOrderByWithAggregationInput[]
    by: PingLogScalarFieldEnum[] | PingLogScalarFieldEnum
    having?: PingLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PingLogCountAggregateInputType | true
    _avg?: PingLogAvgAggregateInputType
    _sum?: PingLogSumAggregateInputType
    _min?: PingLogMinAggregateInputType
    _max?: PingLogMaxAggregateInputType
  }

  export type PingLogGroupByOutputType = {
    id: string
    monitorId: string
    statusCode: number
    durationMs: number
    error: string | null
    timestamp: Date
    _count: PingLogCountAggregateOutputType | null
    _avg: PingLogAvgAggregateOutputType | null
    _sum: PingLogSumAggregateOutputType | null
    _min: PingLogMinAggregateOutputType | null
    _max: PingLogMaxAggregateOutputType | null
  }

  type GetPingLogGroupByPayload<T extends PingLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PingLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PingLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PingLogGroupByOutputType[P]>
            : GetScalarType<T[P], PingLogGroupByOutputType[P]>
        }
      >
    >


  export type PingLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monitorId?: boolean
    statusCode?: boolean
    durationMs?: boolean
    error?: boolean
    timestamp?: boolean
    monitor?: boolean | MonitorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pingLog"]>

  export type PingLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monitorId?: boolean
    statusCode?: boolean
    durationMs?: boolean
    error?: boolean
    timestamp?: boolean
    monitor?: boolean | MonitorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pingLog"]>

  export type PingLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monitorId?: boolean
    statusCode?: boolean
    durationMs?: boolean
    error?: boolean
    timestamp?: boolean
    monitor?: boolean | MonitorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pingLog"]>

  export type PingLogSelectScalar = {
    id?: boolean
    monitorId?: boolean
    statusCode?: boolean
    durationMs?: boolean
    error?: boolean
    timestamp?: boolean
  }

  export type PingLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "monitorId" | "statusCode" | "durationMs" | "error" | "timestamp", ExtArgs["result"]["pingLog"]>
  export type PingLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    monitor?: boolean | MonitorDefaultArgs<ExtArgs>
  }
  export type PingLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    monitor?: boolean | MonitorDefaultArgs<ExtArgs>
  }
  export type PingLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    monitor?: boolean | MonitorDefaultArgs<ExtArgs>
  }

  export type $PingLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PingLog"
    objects: {
      monitor: Prisma.$MonitorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      monitorId: string
      statusCode: number
      durationMs: number
      error: string | null
      timestamp: Date
    }, ExtArgs["result"]["pingLog"]>
    composites: {}
  }

  type PingLogGetPayload<S extends boolean | null | undefined | PingLogDefaultArgs> = $Result.GetResult<Prisma.$PingLogPayload, S>

  type PingLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PingLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PingLogCountAggregateInputType | true
    }

  export interface PingLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PingLog'], meta: { name: 'PingLog' } }
    /**
     * Find zero or one PingLog that matches the filter.
     * @param {PingLogFindUniqueArgs} args - Arguments to find a PingLog
     * @example
     * // Get one PingLog
     * const pingLog = await prisma.pingLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PingLogFindUniqueArgs>(args: SelectSubset<T, PingLogFindUniqueArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PingLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PingLogFindUniqueOrThrowArgs} args - Arguments to find a PingLog
     * @example
     * // Get one PingLog
     * const pingLog = await prisma.pingLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PingLogFindUniqueOrThrowArgs>(args: SelectSubset<T, PingLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PingLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogFindFirstArgs} args - Arguments to find a PingLog
     * @example
     * // Get one PingLog
     * const pingLog = await prisma.pingLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PingLogFindFirstArgs>(args?: SelectSubset<T, PingLogFindFirstArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PingLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogFindFirstOrThrowArgs} args - Arguments to find a PingLog
     * @example
     * // Get one PingLog
     * const pingLog = await prisma.pingLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PingLogFindFirstOrThrowArgs>(args?: SelectSubset<T, PingLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PingLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PingLogs
     * const pingLogs = await prisma.pingLog.findMany()
     * 
     * // Get first 10 PingLogs
     * const pingLogs = await prisma.pingLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pingLogWithIdOnly = await prisma.pingLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PingLogFindManyArgs>(args?: SelectSubset<T, PingLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PingLog.
     * @param {PingLogCreateArgs} args - Arguments to create a PingLog.
     * @example
     * // Create one PingLog
     * const PingLog = await prisma.pingLog.create({
     *   data: {
     *     // ... data to create a PingLog
     *   }
     * })
     * 
     */
    create<T extends PingLogCreateArgs>(args: SelectSubset<T, PingLogCreateArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PingLogs.
     * @param {PingLogCreateManyArgs} args - Arguments to create many PingLogs.
     * @example
     * // Create many PingLogs
     * const pingLog = await prisma.pingLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PingLogCreateManyArgs>(args?: SelectSubset<T, PingLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PingLogs and returns the data saved in the database.
     * @param {PingLogCreateManyAndReturnArgs} args - Arguments to create many PingLogs.
     * @example
     * // Create many PingLogs
     * const pingLog = await prisma.pingLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PingLogs and only return the `id`
     * const pingLogWithIdOnly = await prisma.pingLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PingLogCreateManyAndReturnArgs>(args?: SelectSubset<T, PingLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PingLog.
     * @param {PingLogDeleteArgs} args - Arguments to delete one PingLog.
     * @example
     * // Delete one PingLog
     * const PingLog = await prisma.pingLog.delete({
     *   where: {
     *     // ... filter to delete one PingLog
     *   }
     * })
     * 
     */
    delete<T extends PingLogDeleteArgs>(args: SelectSubset<T, PingLogDeleteArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PingLog.
     * @param {PingLogUpdateArgs} args - Arguments to update one PingLog.
     * @example
     * // Update one PingLog
     * const pingLog = await prisma.pingLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PingLogUpdateArgs>(args: SelectSubset<T, PingLogUpdateArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PingLogs.
     * @param {PingLogDeleteManyArgs} args - Arguments to filter PingLogs to delete.
     * @example
     * // Delete a few PingLogs
     * const { count } = await prisma.pingLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PingLogDeleteManyArgs>(args?: SelectSubset<T, PingLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PingLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PingLogs
     * const pingLog = await prisma.pingLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PingLogUpdateManyArgs>(args: SelectSubset<T, PingLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PingLogs and returns the data updated in the database.
     * @param {PingLogUpdateManyAndReturnArgs} args - Arguments to update many PingLogs.
     * @example
     * // Update many PingLogs
     * const pingLog = await prisma.pingLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PingLogs and only return the `id`
     * const pingLogWithIdOnly = await prisma.pingLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PingLogUpdateManyAndReturnArgs>(args: SelectSubset<T, PingLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PingLog.
     * @param {PingLogUpsertArgs} args - Arguments to update or create a PingLog.
     * @example
     * // Update or create a PingLog
     * const pingLog = await prisma.pingLog.upsert({
     *   create: {
     *     // ... data to create a PingLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PingLog we want to update
     *   }
     * })
     */
    upsert<T extends PingLogUpsertArgs>(args: SelectSubset<T, PingLogUpsertArgs<ExtArgs>>): Prisma__PingLogClient<$Result.GetResult<Prisma.$PingLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PingLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogCountArgs} args - Arguments to filter PingLogs to count.
     * @example
     * // Count the number of PingLogs
     * const count = await prisma.pingLog.count({
     *   where: {
     *     // ... the filter for the PingLogs we want to count
     *   }
     * })
    **/
    count<T extends PingLogCountArgs>(
      args?: Subset<T, PingLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PingLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PingLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PingLogAggregateArgs>(args: Subset<T, PingLogAggregateArgs>): Prisma.PrismaPromise<GetPingLogAggregateType<T>>

    /**
     * Group by PingLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PingLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PingLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PingLogGroupByArgs['orderBy'] }
        : { orderBy?: PingLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PingLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPingLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PingLog model
   */
  readonly fields: PingLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PingLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PingLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    monitor<T extends MonitorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MonitorDefaultArgs<ExtArgs>>): Prisma__MonitorClient<$Result.GetResult<Prisma.$MonitorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PingLog model
   */
  interface PingLogFieldRefs {
    readonly id: FieldRef<"PingLog", 'String'>
    readonly monitorId: FieldRef<"PingLog", 'String'>
    readonly statusCode: FieldRef<"PingLog", 'Int'>
    readonly durationMs: FieldRef<"PingLog", 'Int'>
    readonly error: FieldRef<"PingLog", 'String'>
    readonly timestamp: FieldRef<"PingLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PingLog findUnique
   */
  export type PingLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * Filter, which PingLog to fetch.
     */
    where: PingLogWhereUniqueInput
  }

  /**
   * PingLog findUniqueOrThrow
   */
  export type PingLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * Filter, which PingLog to fetch.
     */
    where: PingLogWhereUniqueInput
  }

  /**
   * PingLog findFirst
   */
  export type PingLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * Filter, which PingLog to fetch.
     */
    where?: PingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PingLogs to fetch.
     */
    orderBy?: PingLogOrderByWithRelationInput | PingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PingLogs.
     */
    cursor?: PingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PingLogs.
     */
    distinct?: PingLogScalarFieldEnum | PingLogScalarFieldEnum[]
  }

  /**
   * PingLog findFirstOrThrow
   */
  export type PingLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * Filter, which PingLog to fetch.
     */
    where?: PingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PingLogs to fetch.
     */
    orderBy?: PingLogOrderByWithRelationInput | PingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PingLogs.
     */
    cursor?: PingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PingLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PingLogs.
     */
    distinct?: PingLogScalarFieldEnum | PingLogScalarFieldEnum[]
  }

  /**
   * PingLog findMany
   */
  export type PingLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * Filter, which PingLogs to fetch.
     */
    where?: PingLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PingLogs to fetch.
     */
    orderBy?: PingLogOrderByWithRelationInput | PingLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PingLogs.
     */
    cursor?: PingLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PingLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PingLogs.
     */
    skip?: number
    distinct?: PingLogScalarFieldEnum | PingLogScalarFieldEnum[]
  }

  /**
   * PingLog create
   */
  export type PingLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * The data needed to create a PingLog.
     */
    data: XOR<PingLogCreateInput, PingLogUncheckedCreateInput>
  }

  /**
   * PingLog createMany
   */
  export type PingLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PingLogs.
     */
    data: PingLogCreateManyInput | PingLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PingLog createManyAndReturn
   */
  export type PingLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * The data used to create many PingLogs.
     */
    data: PingLogCreateManyInput | PingLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PingLog update
   */
  export type PingLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * The data needed to update a PingLog.
     */
    data: XOR<PingLogUpdateInput, PingLogUncheckedUpdateInput>
    /**
     * Choose, which PingLog to update.
     */
    where: PingLogWhereUniqueInput
  }

  /**
   * PingLog updateMany
   */
  export type PingLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PingLogs.
     */
    data: XOR<PingLogUpdateManyMutationInput, PingLogUncheckedUpdateManyInput>
    /**
     * Filter which PingLogs to update
     */
    where?: PingLogWhereInput
    /**
     * Limit how many PingLogs to update.
     */
    limit?: number
  }

  /**
   * PingLog updateManyAndReturn
   */
  export type PingLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * The data used to update PingLogs.
     */
    data: XOR<PingLogUpdateManyMutationInput, PingLogUncheckedUpdateManyInput>
    /**
     * Filter which PingLogs to update
     */
    where?: PingLogWhereInput
    /**
     * Limit how many PingLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PingLog upsert
   */
  export type PingLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * The filter to search for the PingLog to update in case it exists.
     */
    where: PingLogWhereUniqueInput
    /**
     * In case the PingLog found by the `where` argument doesn't exist, create a new PingLog with this data.
     */
    create: XOR<PingLogCreateInput, PingLogUncheckedCreateInput>
    /**
     * In case the PingLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PingLogUpdateInput, PingLogUncheckedUpdateInput>
  }

  /**
   * PingLog delete
   */
  export type PingLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
    /**
     * Filter which PingLog to delete.
     */
    where: PingLogWhereUniqueInput
  }

  /**
   * PingLog deleteMany
   */
  export type PingLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PingLogs to delete
     */
    where?: PingLogWhereInput
    /**
     * Limit how many PingLogs to delete.
     */
    limit?: number
  }

  /**
   * PingLog without action
   */
  export type PingLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PingLog
     */
    select?: PingLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PingLog
     */
    omit?: PingLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PingLogInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const MonitorScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    url: 'url',
    frequency: 'frequency',
    isActive: 'isActive',
    nextCheck: 'nextCheck',
    status: 'status',
    lastCheck: 'lastCheck',
    createdAt: 'createdAt'
  };

  export type MonitorScalarFieldEnum = (typeof MonitorScalarFieldEnum)[keyof typeof MonitorScalarFieldEnum]


  export const PingLogScalarFieldEnum: {
    id: 'id',
    monitorId: 'monitorId',
    statusCode: 'statusCode',
    durationMs: 'durationMs',
    error: 'error',
    timestamp: 'timestamp'
  };

  export type PingLogScalarFieldEnum = (typeof PingLogScalarFieldEnum)[keyof typeof PingLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    monitors?: MonitorListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    monitors?: MonitorOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    monitors?: MonitorListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type MonitorWhereInput = {
    AND?: MonitorWhereInput | MonitorWhereInput[]
    OR?: MonitorWhereInput[]
    NOT?: MonitorWhereInput | MonitorWhereInput[]
    id?: StringFilter<"Monitor"> | string
    userId?: StringFilter<"Monitor"> | string
    name?: StringFilter<"Monitor"> | string
    url?: StringFilter<"Monitor"> | string
    frequency?: IntFilter<"Monitor"> | number
    isActive?: BoolFilter<"Monitor"> | boolean
    nextCheck?: DateTimeFilter<"Monitor"> | Date | string
    status?: StringFilter<"Monitor"> | string
    lastCheck?: DateTimeNullableFilter<"Monitor"> | Date | string | null
    createdAt?: DateTimeFilter<"Monitor"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    logs?: PingLogListRelationFilter
  }

  export type MonitorOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    frequency?: SortOrder
    isActive?: SortOrder
    nextCheck?: SortOrder
    status?: SortOrder
    lastCheck?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    logs?: PingLogOrderByRelationAggregateInput
  }

  export type MonitorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MonitorWhereInput | MonitorWhereInput[]
    OR?: MonitorWhereInput[]
    NOT?: MonitorWhereInput | MonitorWhereInput[]
    userId?: StringFilter<"Monitor"> | string
    name?: StringFilter<"Monitor"> | string
    url?: StringFilter<"Monitor"> | string
    frequency?: IntFilter<"Monitor"> | number
    isActive?: BoolFilter<"Monitor"> | boolean
    nextCheck?: DateTimeFilter<"Monitor"> | Date | string
    status?: StringFilter<"Monitor"> | string
    lastCheck?: DateTimeNullableFilter<"Monitor"> | Date | string | null
    createdAt?: DateTimeFilter<"Monitor"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    logs?: PingLogListRelationFilter
  }, "id">

  export type MonitorOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    frequency?: SortOrder
    isActive?: SortOrder
    nextCheck?: SortOrder
    status?: SortOrder
    lastCheck?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MonitorCountOrderByAggregateInput
    _avg?: MonitorAvgOrderByAggregateInput
    _max?: MonitorMaxOrderByAggregateInput
    _min?: MonitorMinOrderByAggregateInput
    _sum?: MonitorSumOrderByAggregateInput
  }

  export type MonitorScalarWhereWithAggregatesInput = {
    AND?: MonitorScalarWhereWithAggregatesInput | MonitorScalarWhereWithAggregatesInput[]
    OR?: MonitorScalarWhereWithAggregatesInput[]
    NOT?: MonitorScalarWhereWithAggregatesInput | MonitorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Monitor"> | string
    userId?: StringWithAggregatesFilter<"Monitor"> | string
    name?: StringWithAggregatesFilter<"Monitor"> | string
    url?: StringWithAggregatesFilter<"Monitor"> | string
    frequency?: IntWithAggregatesFilter<"Monitor"> | number
    isActive?: BoolWithAggregatesFilter<"Monitor"> | boolean
    nextCheck?: DateTimeWithAggregatesFilter<"Monitor"> | Date | string
    status?: StringWithAggregatesFilter<"Monitor"> | string
    lastCheck?: DateTimeNullableWithAggregatesFilter<"Monitor"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Monitor"> | Date | string
  }

  export type PingLogWhereInput = {
    AND?: PingLogWhereInput | PingLogWhereInput[]
    OR?: PingLogWhereInput[]
    NOT?: PingLogWhereInput | PingLogWhereInput[]
    id?: StringFilter<"PingLog"> | string
    monitorId?: StringFilter<"PingLog"> | string
    statusCode?: IntFilter<"PingLog"> | number
    durationMs?: IntFilter<"PingLog"> | number
    error?: StringNullableFilter<"PingLog"> | string | null
    timestamp?: DateTimeFilter<"PingLog"> | Date | string
    monitor?: XOR<MonitorScalarRelationFilter, MonitorWhereInput>
  }

  export type PingLogOrderByWithRelationInput = {
    id?: SortOrder
    monitorId?: SortOrder
    statusCode?: SortOrder
    durationMs?: SortOrder
    error?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    monitor?: MonitorOrderByWithRelationInput
  }

  export type PingLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PingLogWhereInput | PingLogWhereInput[]
    OR?: PingLogWhereInput[]
    NOT?: PingLogWhereInput | PingLogWhereInput[]
    monitorId?: StringFilter<"PingLog"> | string
    statusCode?: IntFilter<"PingLog"> | number
    durationMs?: IntFilter<"PingLog"> | number
    error?: StringNullableFilter<"PingLog"> | string | null
    timestamp?: DateTimeFilter<"PingLog"> | Date | string
    monitor?: XOR<MonitorScalarRelationFilter, MonitorWhereInput>
  }, "id">

  export type PingLogOrderByWithAggregationInput = {
    id?: SortOrder
    monitorId?: SortOrder
    statusCode?: SortOrder
    durationMs?: SortOrder
    error?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    _count?: PingLogCountOrderByAggregateInput
    _avg?: PingLogAvgOrderByAggregateInput
    _max?: PingLogMaxOrderByAggregateInput
    _min?: PingLogMinOrderByAggregateInput
    _sum?: PingLogSumOrderByAggregateInput
  }

  export type PingLogScalarWhereWithAggregatesInput = {
    AND?: PingLogScalarWhereWithAggregatesInput | PingLogScalarWhereWithAggregatesInput[]
    OR?: PingLogScalarWhereWithAggregatesInput[]
    NOT?: PingLogScalarWhereWithAggregatesInput | PingLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PingLog"> | string
    monitorId?: StringWithAggregatesFilter<"PingLog"> | string
    statusCode?: IntWithAggregatesFilter<"PingLog"> | number
    durationMs?: IntWithAggregatesFilter<"PingLog"> | number
    error?: StringNullableWithAggregatesFilter<"PingLog"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"PingLog"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password: string
    createdAt?: Date | string
    monitors?: MonitorCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    createdAt?: Date | string
    monitors?: MonitorUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    monitors?: MonitorUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    monitors?: MonitorUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonitorCreateInput = {
    id?: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutMonitorsInput
    logs?: PingLogCreateNestedManyWithoutMonitorInput
  }

  export type MonitorUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
    logs?: PingLogUncheckedCreateNestedManyWithoutMonitorInput
  }

  export type MonitorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMonitorsNestedInput
    logs?: PingLogUpdateManyWithoutMonitorNestedInput
  }

  export type MonitorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: PingLogUncheckedUpdateManyWithoutMonitorNestedInput
  }

  export type MonitorCreateManyInput = {
    id?: string
    userId: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
  }

  export type MonitorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonitorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogCreateInput = {
    id?: string
    statusCode: number
    durationMs: number
    error?: string | null
    timestamp?: Date | string
    monitor: MonitorCreateNestedOneWithoutLogsInput
  }

  export type PingLogUncheckedCreateInput = {
    id?: string
    monitorId: string
    statusCode: number
    durationMs: number
    error?: string | null
    timestamp?: Date | string
  }

  export type PingLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    monitor?: MonitorUpdateOneRequiredWithoutLogsNestedInput
  }

  export type PingLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    monitorId?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogCreateManyInput = {
    id?: string
    monitorId: string
    statusCode: number
    durationMs: number
    error?: string | null
    timestamp?: Date | string
  }

  export type PingLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    monitorId?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type MonitorListRelationFilter = {
    every?: MonitorWhereInput
    some?: MonitorWhereInput
    none?: MonitorWhereInput
  }

  export type MonitorOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PingLogListRelationFilter = {
    every?: PingLogWhereInput
    some?: PingLogWhereInput
    none?: PingLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PingLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MonitorCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    frequency?: SortOrder
    isActive?: SortOrder
    nextCheck?: SortOrder
    status?: SortOrder
    lastCheck?: SortOrder
    createdAt?: SortOrder
  }

  export type MonitorAvgOrderByAggregateInput = {
    frequency?: SortOrder
  }

  export type MonitorMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    frequency?: SortOrder
    isActive?: SortOrder
    nextCheck?: SortOrder
    status?: SortOrder
    lastCheck?: SortOrder
    createdAt?: SortOrder
  }

  export type MonitorMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    frequency?: SortOrder
    isActive?: SortOrder
    nextCheck?: SortOrder
    status?: SortOrder
    lastCheck?: SortOrder
    createdAt?: SortOrder
  }

  export type MonitorSumOrderByAggregateInput = {
    frequency?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type MonitorScalarRelationFilter = {
    is?: MonitorWhereInput
    isNot?: MonitorWhereInput
  }

  export type PingLogCountOrderByAggregateInput = {
    id?: SortOrder
    monitorId?: SortOrder
    statusCode?: SortOrder
    durationMs?: SortOrder
    error?: SortOrder
    timestamp?: SortOrder
  }

  export type PingLogAvgOrderByAggregateInput = {
    statusCode?: SortOrder
    durationMs?: SortOrder
  }

  export type PingLogMaxOrderByAggregateInput = {
    id?: SortOrder
    monitorId?: SortOrder
    statusCode?: SortOrder
    durationMs?: SortOrder
    error?: SortOrder
    timestamp?: SortOrder
  }

  export type PingLogMinOrderByAggregateInput = {
    id?: SortOrder
    monitorId?: SortOrder
    statusCode?: SortOrder
    durationMs?: SortOrder
    error?: SortOrder
    timestamp?: SortOrder
  }

  export type PingLogSumOrderByAggregateInput = {
    statusCode?: SortOrder
    durationMs?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type MonitorCreateNestedManyWithoutUserInput = {
    create?: XOR<MonitorCreateWithoutUserInput, MonitorUncheckedCreateWithoutUserInput> | MonitorCreateWithoutUserInput[] | MonitorUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MonitorCreateOrConnectWithoutUserInput | MonitorCreateOrConnectWithoutUserInput[]
    createMany?: MonitorCreateManyUserInputEnvelope
    connect?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
  }

  export type MonitorUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MonitorCreateWithoutUserInput, MonitorUncheckedCreateWithoutUserInput> | MonitorCreateWithoutUserInput[] | MonitorUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MonitorCreateOrConnectWithoutUserInput | MonitorCreateOrConnectWithoutUserInput[]
    createMany?: MonitorCreateManyUserInputEnvelope
    connect?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MonitorUpdateManyWithoutUserNestedInput = {
    create?: XOR<MonitorCreateWithoutUserInput, MonitorUncheckedCreateWithoutUserInput> | MonitorCreateWithoutUserInput[] | MonitorUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MonitorCreateOrConnectWithoutUserInput | MonitorCreateOrConnectWithoutUserInput[]
    upsert?: MonitorUpsertWithWhereUniqueWithoutUserInput | MonitorUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MonitorCreateManyUserInputEnvelope
    set?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    disconnect?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    delete?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    connect?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    update?: MonitorUpdateWithWhereUniqueWithoutUserInput | MonitorUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MonitorUpdateManyWithWhereWithoutUserInput | MonitorUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MonitorScalarWhereInput | MonitorScalarWhereInput[]
  }

  export type MonitorUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MonitorCreateWithoutUserInput, MonitorUncheckedCreateWithoutUserInput> | MonitorCreateWithoutUserInput[] | MonitorUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MonitorCreateOrConnectWithoutUserInput | MonitorCreateOrConnectWithoutUserInput[]
    upsert?: MonitorUpsertWithWhereUniqueWithoutUserInput | MonitorUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MonitorCreateManyUserInputEnvelope
    set?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    disconnect?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    delete?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    connect?: MonitorWhereUniqueInput | MonitorWhereUniqueInput[]
    update?: MonitorUpdateWithWhereUniqueWithoutUserInput | MonitorUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MonitorUpdateManyWithWhereWithoutUserInput | MonitorUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MonitorScalarWhereInput | MonitorScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMonitorsInput = {
    create?: XOR<UserCreateWithoutMonitorsInput, UserUncheckedCreateWithoutMonitorsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMonitorsInput
    connect?: UserWhereUniqueInput
  }

  export type PingLogCreateNestedManyWithoutMonitorInput = {
    create?: XOR<PingLogCreateWithoutMonitorInput, PingLogUncheckedCreateWithoutMonitorInput> | PingLogCreateWithoutMonitorInput[] | PingLogUncheckedCreateWithoutMonitorInput[]
    connectOrCreate?: PingLogCreateOrConnectWithoutMonitorInput | PingLogCreateOrConnectWithoutMonitorInput[]
    createMany?: PingLogCreateManyMonitorInputEnvelope
    connect?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
  }

  export type PingLogUncheckedCreateNestedManyWithoutMonitorInput = {
    create?: XOR<PingLogCreateWithoutMonitorInput, PingLogUncheckedCreateWithoutMonitorInput> | PingLogCreateWithoutMonitorInput[] | PingLogUncheckedCreateWithoutMonitorInput[]
    connectOrCreate?: PingLogCreateOrConnectWithoutMonitorInput | PingLogCreateOrConnectWithoutMonitorInput[]
    createMany?: PingLogCreateManyMonitorInputEnvelope
    connect?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutMonitorsNestedInput = {
    create?: XOR<UserCreateWithoutMonitorsInput, UserUncheckedCreateWithoutMonitorsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMonitorsInput
    upsert?: UserUpsertWithoutMonitorsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMonitorsInput, UserUpdateWithoutMonitorsInput>, UserUncheckedUpdateWithoutMonitorsInput>
  }

  export type PingLogUpdateManyWithoutMonitorNestedInput = {
    create?: XOR<PingLogCreateWithoutMonitorInput, PingLogUncheckedCreateWithoutMonitorInput> | PingLogCreateWithoutMonitorInput[] | PingLogUncheckedCreateWithoutMonitorInput[]
    connectOrCreate?: PingLogCreateOrConnectWithoutMonitorInput | PingLogCreateOrConnectWithoutMonitorInput[]
    upsert?: PingLogUpsertWithWhereUniqueWithoutMonitorInput | PingLogUpsertWithWhereUniqueWithoutMonitorInput[]
    createMany?: PingLogCreateManyMonitorInputEnvelope
    set?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    disconnect?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    delete?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    connect?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    update?: PingLogUpdateWithWhereUniqueWithoutMonitorInput | PingLogUpdateWithWhereUniqueWithoutMonitorInput[]
    updateMany?: PingLogUpdateManyWithWhereWithoutMonitorInput | PingLogUpdateManyWithWhereWithoutMonitorInput[]
    deleteMany?: PingLogScalarWhereInput | PingLogScalarWhereInput[]
  }

  export type PingLogUncheckedUpdateManyWithoutMonitorNestedInput = {
    create?: XOR<PingLogCreateWithoutMonitorInput, PingLogUncheckedCreateWithoutMonitorInput> | PingLogCreateWithoutMonitorInput[] | PingLogUncheckedCreateWithoutMonitorInput[]
    connectOrCreate?: PingLogCreateOrConnectWithoutMonitorInput | PingLogCreateOrConnectWithoutMonitorInput[]
    upsert?: PingLogUpsertWithWhereUniqueWithoutMonitorInput | PingLogUpsertWithWhereUniqueWithoutMonitorInput[]
    createMany?: PingLogCreateManyMonitorInputEnvelope
    set?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    disconnect?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    delete?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    connect?: PingLogWhereUniqueInput | PingLogWhereUniqueInput[]
    update?: PingLogUpdateWithWhereUniqueWithoutMonitorInput | PingLogUpdateWithWhereUniqueWithoutMonitorInput[]
    updateMany?: PingLogUpdateManyWithWhereWithoutMonitorInput | PingLogUpdateManyWithWhereWithoutMonitorInput[]
    deleteMany?: PingLogScalarWhereInput | PingLogScalarWhereInput[]
  }

  export type MonitorCreateNestedOneWithoutLogsInput = {
    create?: XOR<MonitorCreateWithoutLogsInput, MonitorUncheckedCreateWithoutLogsInput>
    connectOrCreate?: MonitorCreateOrConnectWithoutLogsInput
    connect?: MonitorWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type MonitorUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<MonitorCreateWithoutLogsInput, MonitorUncheckedCreateWithoutLogsInput>
    connectOrCreate?: MonitorCreateOrConnectWithoutLogsInput
    upsert?: MonitorUpsertWithoutLogsInput
    connect?: MonitorWhereUniqueInput
    update?: XOR<XOR<MonitorUpdateToOneWithWhereWithoutLogsInput, MonitorUpdateWithoutLogsInput>, MonitorUncheckedUpdateWithoutLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type MonitorCreateWithoutUserInput = {
    id?: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
    logs?: PingLogCreateNestedManyWithoutMonitorInput
  }

  export type MonitorUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
    logs?: PingLogUncheckedCreateNestedManyWithoutMonitorInput
  }

  export type MonitorCreateOrConnectWithoutUserInput = {
    where: MonitorWhereUniqueInput
    create: XOR<MonitorCreateWithoutUserInput, MonitorUncheckedCreateWithoutUserInput>
  }

  export type MonitorCreateManyUserInputEnvelope = {
    data: MonitorCreateManyUserInput | MonitorCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MonitorUpsertWithWhereUniqueWithoutUserInput = {
    where: MonitorWhereUniqueInput
    update: XOR<MonitorUpdateWithoutUserInput, MonitorUncheckedUpdateWithoutUserInput>
    create: XOR<MonitorCreateWithoutUserInput, MonitorUncheckedCreateWithoutUserInput>
  }

  export type MonitorUpdateWithWhereUniqueWithoutUserInput = {
    where: MonitorWhereUniqueInput
    data: XOR<MonitorUpdateWithoutUserInput, MonitorUncheckedUpdateWithoutUserInput>
  }

  export type MonitorUpdateManyWithWhereWithoutUserInput = {
    where: MonitorScalarWhereInput
    data: XOR<MonitorUpdateManyMutationInput, MonitorUncheckedUpdateManyWithoutUserInput>
  }

  export type MonitorScalarWhereInput = {
    AND?: MonitorScalarWhereInput | MonitorScalarWhereInput[]
    OR?: MonitorScalarWhereInput[]
    NOT?: MonitorScalarWhereInput | MonitorScalarWhereInput[]
    id?: StringFilter<"Monitor"> | string
    userId?: StringFilter<"Monitor"> | string
    name?: StringFilter<"Monitor"> | string
    url?: StringFilter<"Monitor"> | string
    frequency?: IntFilter<"Monitor"> | number
    isActive?: BoolFilter<"Monitor"> | boolean
    nextCheck?: DateTimeFilter<"Monitor"> | Date | string
    status?: StringFilter<"Monitor"> | string
    lastCheck?: DateTimeNullableFilter<"Monitor"> | Date | string | null
    createdAt?: DateTimeFilter<"Monitor"> | Date | string
  }

  export type UserCreateWithoutMonitorsInput = {
    id?: string
    email: string
    password: string
    createdAt?: Date | string
  }

  export type UserUncheckedCreateWithoutMonitorsInput = {
    id?: string
    email: string
    password: string
    createdAt?: Date | string
  }

  export type UserCreateOrConnectWithoutMonitorsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMonitorsInput, UserUncheckedCreateWithoutMonitorsInput>
  }

  export type PingLogCreateWithoutMonitorInput = {
    id?: string
    statusCode: number
    durationMs: number
    error?: string | null
    timestamp?: Date | string
  }

  export type PingLogUncheckedCreateWithoutMonitorInput = {
    id?: string
    statusCode: number
    durationMs: number
    error?: string | null
    timestamp?: Date | string
  }

  export type PingLogCreateOrConnectWithoutMonitorInput = {
    where: PingLogWhereUniqueInput
    create: XOR<PingLogCreateWithoutMonitorInput, PingLogUncheckedCreateWithoutMonitorInput>
  }

  export type PingLogCreateManyMonitorInputEnvelope = {
    data: PingLogCreateManyMonitorInput | PingLogCreateManyMonitorInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutMonitorsInput = {
    update: XOR<UserUpdateWithoutMonitorsInput, UserUncheckedUpdateWithoutMonitorsInput>
    create: XOR<UserCreateWithoutMonitorsInput, UserUncheckedCreateWithoutMonitorsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMonitorsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMonitorsInput, UserUncheckedUpdateWithoutMonitorsInput>
  }

  export type UserUpdateWithoutMonitorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutMonitorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogUpsertWithWhereUniqueWithoutMonitorInput = {
    where: PingLogWhereUniqueInput
    update: XOR<PingLogUpdateWithoutMonitorInput, PingLogUncheckedUpdateWithoutMonitorInput>
    create: XOR<PingLogCreateWithoutMonitorInput, PingLogUncheckedCreateWithoutMonitorInput>
  }

  export type PingLogUpdateWithWhereUniqueWithoutMonitorInput = {
    where: PingLogWhereUniqueInput
    data: XOR<PingLogUpdateWithoutMonitorInput, PingLogUncheckedUpdateWithoutMonitorInput>
  }

  export type PingLogUpdateManyWithWhereWithoutMonitorInput = {
    where: PingLogScalarWhereInput
    data: XOR<PingLogUpdateManyMutationInput, PingLogUncheckedUpdateManyWithoutMonitorInput>
  }

  export type PingLogScalarWhereInput = {
    AND?: PingLogScalarWhereInput | PingLogScalarWhereInput[]
    OR?: PingLogScalarWhereInput[]
    NOT?: PingLogScalarWhereInput | PingLogScalarWhereInput[]
    id?: StringFilter<"PingLog"> | string
    monitorId?: StringFilter<"PingLog"> | string
    statusCode?: IntFilter<"PingLog"> | number
    durationMs?: IntFilter<"PingLog"> | number
    error?: StringNullableFilter<"PingLog"> | string | null
    timestamp?: DateTimeFilter<"PingLog"> | Date | string
  }

  export type MonitorCreateWithoutLogsInput = {
    id?: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutMonitorsInput
  }

  export type MonitorUncheckedCreateWithoutLogsInput = {
    id?: string
    userId: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
  }

  export type MonitorCreateOrConnectWithoutLogsInput = {
    where: MonitorWhereUniqueInput
    create: XOR<MonitorCreateWithoutLogsInput, MonitorUncheckedCreateWithoutLogsInput>
  }

  export type MonitorUpsertWithoutLogsInput = {
    update: XOR<MonitorUpdateWithoutLogsInput, MonitorUncheckedUpdateWithoutLogsInput>
    create: XOR<MonitorCreateWithoutLogsInput, MonitorUncheckedCreateWithoutLogsInput>
    where?: MonitorWhereInput
  }

  export type MonitorUpdateToOneWithWhereWithoutLogsInput = {
    where?: MonitorWhereInput
    data: XOR<MonitorUpdateWithoutLogsInput, MonitorUncheckedUpdateWithoutLogsInput>
  }

  export type MonitorUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMonitorsNestedInput
  }

  export type MonitorUncheckedUpdateWithoutLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonitorCreateManyUserInput = {
    id?: string
    name: string
    url: string
    frequency?: number
    isActive?: boolean
    nextCheck?: Date | string
    status?: string
    lastCheck?: Date | string | null
    createdAt?: Date | string
  }

  export type MonitorUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: PingLogUpdateManyWithoutMonitorNestedInput
  }

  export type MonitorUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: PingLogUncheckedUpdateManyWithoutMonitorNestedInput
  }

  export type MonitorUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    frequency?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    nextCheck?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogCreateManyMonitorInput = {
    id?: string
    statusCode: number
    durationMs: number
    error?: string | null
    timestamp?: Date | string
  }

  export type PingLogUpdateWithoutMonitorInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogUncheckedUpdateWithoutMonitorInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PingLogUncheckedUpdateManyWithoutMonitorInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    durationMs?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}