
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model LoanRequest
 * 
 */
export type LoanRequest = $Result.DefaultSelection<Prisma.$LoanRequestPayload>
/**
 * Model WorkflowRun
 * 
 */
export type WorkflowRun = $Result.DefaultSelection<Prisma.$WorkflowRunPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model DocumentEmbedding
 * 
 */
export type DocumentEmbedding = $Result.DefaultSelection<Prisma.$DocumentEmbeddingPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
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
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.loanRequest`: Exposes CRUD operations for the **LoanRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LoanRequests
    * const loanRequests = await prisma.loanRequest.findMany()
    * ```
    */
  get loanRequest(): Prisma.LoanRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workflowRun`: Exposes CRUD operations for the **WorkflowRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkflowRuns
    * const workflowRuns = await prisma.workflowRun.findMany()
    * ```
    */
  get workflowRun(): Prisma.WorkflowRunDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.documentEmbedding`: Exposes CRUD operations for the **DocumentEmbedding** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DocumentEmbeddings
    * const documentEmbeddings = await prisma.documentEmbedding.findMany()
    * ```
    */
  get documentEmbedding(): Prisma.DocumentEmbeddingDelegate<ExtArgs, ClientOptions>;
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
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

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
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
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
    Tenant: 'Tenant',
    User: 'User',
    LoanRequest: 'LoanRequest',
    WorkflowRun: 'WorkflowRun',
    AuditLog: 'AuditLog',
    DocumentEmbedding: 'DocumentEmbedding'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tenant" | "user" | "loanRequest" | "workflowRun" | "auditLog" | "documentEmbedding"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
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
      LoanRequest: {
        payload: Prisma.$LoanRequestPayload<ExtArgs>
        fields: Prisma.LoanRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LoanRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LoanRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>
          }
          findFirst: {
            args: Prisma.LoanRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LoanRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>
          }
          findMany: {
            args: Prisma.LoanRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>[]
          }
          create: {
            args: Prisma.LoanRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>
          }
          createMany: {
            args: Prisma.LoanRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LoanRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>[]
          }
          delete: {
            args: Prisma.LoanRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>
          }
          update: {
            args: Prisma.LoanRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>
          }
          deleteMany: {
            args: Prisma.LoanRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LoanRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LoanRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>[]
          }
          upsert: {
            args: Prisma.LoanRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoanRequestPayload>
          }
          aggregate: {
            args: Prisma.LoanRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLoanRequest>
          }
          groupBy: {
            args: Prisma.LoanRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<LoanRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.LoanRequestCountArgs<ExtArgs>
            result: $Utils.Optional<LoanRequestCountAggregateOutputType> | number
          }
        }
      }
      WorkflowRun: {
        payload: Prisma.$WorkflowRunPayload<ExtArgs>
        fields: Prisma.WorkflowRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkflowRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkflowRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>
          }
          findFirst: {
            args: Prisma.WorkflowRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkflowRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>
          }
          findMany: {
            args: Prisma.WorkflowRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>[]
          }
          create: {
            args: Prisma.WorkflowRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>
          }
          createMany: {
            args: Prisma.WorkflowRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkflowRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>[]
          }
          delete: {
            args: Prisma.WorkflowRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>
          }
          update: {
            args: Prisma.WorkflowRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>
          }
          deleteMany: {
            args: Prisma.WorkflowRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkflowRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkflowRunUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>[]
          }
          upsert: {
            args: Prisma.WorkflowRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkflowRunPayload>
          }
          aggregate: {
            args: Prisma.WorkflowRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkflowRun>
          }
          groupBy: {
            args: Prisma.WorkflowRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkflowRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkflowRunCountArgs<ExtArgs>
            result: $Utils.Optional<WorkflowRunCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      DocumentEmbedding: {
        payload: Prisma.$DocumentEmbeddingPayload<ExtArgs>
        fields: Prisma.DocumentEmbeddingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentEmbeddingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentEmbeddingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload>
          }
          findFirst: {
            args: Prisma.DocumentEmbeddingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentEmbeddingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload>
          }
          findMany: {
            args: Prisma.DocumentEmbeddingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload>[]
          }
          delete: {
            args: Prisma.DocumentEmbeddingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload>
          }
          update: {
            args: Prisma.DocumentEmbeddingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload>
          }
          deleteMany: {
            args: Prisma.DocumentEmbeddingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentEmbeddingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DocumentEmbeddingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentEmbeddingPayload>[]
          }
          aggregate: {
            args: Prisma.DocumentEmbeddingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumentEmbedding>
          }
          groupBy: {
            args: Prisma.DocumentEmbeddingGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentEmbeddingGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentEmbeddingCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentEmbeddingCountAggregateOutputType> | number
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
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
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
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
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
    adapter?: runtime.SqlDriverAdapterFactory | null
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
  }
  export type GlobalOmitConfig = {
    tenant?: TenantOmit
    user?: UserOmit
    loanRequest?: LoanRequestOmit
    workflowRun?: WorkflowRunOmit
    auditLog?: AuditLogOmit
    documentEmbedding?: DocumentEmbeddingOmit
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
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    plan: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    plan: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    plan: number
    isActive: number
    config: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    isActive?: true
    config?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    name: string
    slug: string
    plan: string
    isActive: boolean
    config: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    isActive?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    isActive?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    isActive?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    isActive?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "plan" | "isActive" | "config" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      plan: string
      isActive: boolean
      config: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
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
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
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
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly plan: FieldRef<"Tenant", 'String'>
    readonly isActive: FieldRef<"Tenant", 'Boolean'>
    readonly config: FieldRef<"Tenant", 'Json'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
  }


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
    tenantId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    role: string | null
    passwordHash: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    role: string | null
    passwordHash: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    firstName: number
    lastName: number
    role: number
    passwordHash: number
    isActive: number
    lastLoginAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    firstName?: true
    lastName?: true
    role?: true
    passwordHash?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    firstName?: true
    lastName?: true
    role?: true
    passwordHash?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    firstName?: true
    lastName?: true
    role?: true
    passwordHash?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
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
    tenantId: string
    email: string
    firstName: string | null
    lastName: string | null
    role: string
    passwordHash: string | null
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
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
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    passwordHash?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    passwordHash?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    passwordHash?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    passwordHash?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "firstName" | "lastName" | "role" | "passwordHash" | "isActive" | "lastLoginAt" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      firstName: string | null
      lastName: string | null
      role: string
      passwordHash: string | null
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
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
    readonly tenantId: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
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
  }


  /**
   * Model LoanRequest
   */

  export type AggregateLoanRequest = {
    _count: LoanRequestCountAggregateOutputType | null
    _avg: LoanRequestAvgAggregateOutputType | null
    _sum: LoanRequestSumAggregateOutputType | null
    _min: LoanRequestMinAggregateOutputType | null
    _max: LoanRequestMaxAggregateOutputType | null
  }

  export type LoanRequestAvgAggregateOutputType = {
    requestedAmount: Decimal | null
    requestedTermMonths: number | null
    applicantAnnualIncome: Decimal | null
    applicantCreditScore: number | null
    applicantExistingDebt: Decimal | null
  }

  export type LoanRequestSumAggregateOutputType = {
    requestedAmount: Decimal | null
    requestedTermMonths: number | null
    applicantAnnualIncome: Decimal | null
    applicantCreditScore: number | null
    applicantExistingDebt: Decimal | null
  }

  export type LoanRequestMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    status: string | null
    loanType: string | null
    requestedAmount: Decimal | null
    requestedTermMonths: number | null
    purpose: string | null
    applicantId: string | null
    applicantFirstName: string | null
    applicantLastName: string | null
    applicantEmail: string | null
    applicantPhone: string | null
    applicantDateOfBirth: Date | null
    applicantNationalId: string | null
    applicantEmploymentStatus: string | null
    applicantAnnualIncome: Decimal | null
    applicantCreditScore: number | null
    applicantExistingDebt: Decimal | null
    applicantKycVerified: boolean | null
    applicantKycVerifiedAt: Date | null
    applicantAddressEnc: string | null
    submittedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    idempotencyKey: string | null
    piiKeyVersion: string | null
  }

  export type LoanRequestMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    status: string | null
    loanType: string | null
    requestedAmount: Decimal | null
    requestedTermMonths: number | null
    purpose: string | null
    applicantId: string | null
    applicantFirstName: string | null
    applicantLastName: string | null
    applicantEmail: string | null
    applicantPhone: string | null
    applicantDateOfBirth: Date | null
    applicantNationalId: string | null
    applicantEmploymentStatus: string | null
    applicantAnnualIncome: Decimal | null
    applicantCreditScore: number | null
    applicantExistingDebt: Decimal | null
    applicantKycVerified: boolean | null
    applicantKycVerifiedAt: Date | null
    applicantAddressEnc: string | null
    submittedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    idempotencyKey: string | null
    piiKeyVersion: string | null
  }

  export type LoanRequestCountAggregateOutputType = {
    id: number
    tenantId: number
    status: number
    loanType: number
    requestedAmount: number
    requestedTermMonths: number
    purpose: number
    applicantId: number
    applicantFirstName: number
    applicantLastName: number
    applicantEmail: number
    applicantPhone: number
    applicantDateOfBirth: number
    applicantNationalId: number
    applicantEmploymentStatus: number
    applicantAnnualIncome: number
    applicantCreditScore: number
    applicantExistingDebt: number
    applicantKycVerified: number
    applicantKycVerifiedAt: number
    applicantAddress: number
    applicantAddressEnc: number
    businessInfo: number
    collateral: number
    metadata: number
    submittedAt: number
    createdAt: number
    updatedAt: number
    idempotencyKey: number
    piiKeyVersion: number
    _all: number
  }


  export type LoanRequestAvgAggregateInputType = {
    requestedAmount?: true
    requestedTermMonths?: true
    applicantAnnualIncome?: true
    applicantCreditScore?: true
    applicantExistingDebt?: true
  }

  export type LoanRequestSumAggregateInputType = {
    requestedAmount?: true
    requestedTermMonths?: true
    applicantAnnualIncome?: true
    applicantCreditScore?: true
    applicantExistingDebt?: true
  }

  export type LoanRequestMinAggregateInputType = {
    id?: true
    tenantId?: true
    status?: true
    loanType?: true
    requestedAmount?: true
    requestedTermMonths?: true
    purpose?: true
    applicantId?: true
    applicantFirstName?: true
    applicantLastName?: true
    applicantEmail?: true
    applicantPhone?: true
    applicantDateOfBirth?: true
    applicantNationalId?: true
    applicantEmploymentStatus?: true
    applicantAnnualIncome?: true
    applicantCreditScore?: true
    applicantExistingDebt?: true
    applicantKycVerified?: true
    applicantKycVerifiedAt?: true
    applicantAddressEnc?: true
    submittedAt?: true
    createdAt?: true
    updatedAt?: true
    idempotencyKey?: true
    piiKeyVersion?: true
  }

  export type LoanRequestMaxAggregateInputType = {
    id?: true
    tenantId?: true
    status?: true
    loanType?: true
    requestedAmount?: true
    requestedTermMonths?: true
    purpose?: true
    applicantId?: true
    applicantFirstName?: true
    applicantLastName?: true
    applicantEmail?: true
    applicantPhone?: true
    applicantDateOfBirth?: true
    applicantNationalId?: true
    applicantEmploymentStatus?: true
    applicantAnnualIncome?: true
    applicantCreditScore?: true
    applicantExistingDebt?: true
    applicantKycVerified?: true
    applicantKycVerifiedAt?: true
    applicantAddressEnc?: true
    submittedAt?: true
    createdAt?: true
    updatedAt?: true
    idempotencyKey?: true
    piiKeyVersion?: true
  }

  export type LoanRequestCountAggregateInputType = {
    id?: true
    tenantId?: true
    status?: true
    loanType?: true
    requestedAmount?: true
    requestedTermMonths?: true
    purpose?: true
    applicantId?: true
    applicantFirstName?: true
    applicantLastName?: true
    applicantEmail?: true
    applicantPhone?: true
    applicantDateOfBirth?: true
    applicantNationalId?: true
    applicantEmploymentStatus?: true
    applicantAnnualIncome?: true
    applicantCreditScore?: true
    applicantExistingDebt?: true
    applicantKycVerified?: true
    applicantKycVerifiedAt?: true
    applicantAddress?: true
    applicantAddressEnc?: true
    businessInfo?: true
    collateral?: true
    metadata?: true
    submittedAt?: true
    createdAt?: true
    updatedAt?: true
    idempotencyKey?: true
    piiKeyVersion?: true
    _all?: true
  }

  export type LoanRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoanRequest to aggregate.
     */
    where?: LoanRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoanRequests to fetch.
     */
    orderBy?: LoanRequestOrderByWithRelationInput | LoanRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LoanRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoanRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoanRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LoanRequests
    **/
    _count?: true | LoanRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LoanRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LoanRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LoanRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LoanRequestMaxAggregateInputType
  }

  export type GetLoanRequestAggregateType<T extends LoanRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateLoanRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLoanRequest[P]>
      : GetScalarType<T[P], AggregateLoanRequest[P]>
  }




  export type LoanRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LoanRequestWhereInput
    orderBy?: LoanRequestOrderByWithAggregationInput | LoanRequestOrderByWithAggregationInput[]
    by: LoanRequestScalarFieldEnum[] | LoanRequestScalarFieldEnum
    having?: LoanRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LoanRequestCountAggregateInputType | true
    _avg?: LoanRequestAvgAggregateInputType
    _sum?: LoanRequestSumAggregateInputType
    _min?: LoanRequestMinAggregateInputType
    _max?: LoanRequestMaxAggregateInputType
  }

  export type LoanRequestGroupByOutputType = {
    id: string
    tenantId: string
    status: string
    loanType: string
    requestedAmount: Decimal
    requestedTermMonths: number
    purpose: string
    applicantId: string
    applicantFirstName: string
    applicantLastName: string
    applicantEmail: string
    applicantPhone: string | null
    applicantDateOfBirth: Date | null
    applicantNationalId: string | null
    applicantEmploymentStatus: string | null
    applicantAnnualIncome: Decimal | null
    applicantCreditScore: number | null
    applicantExistingDebt: Decimal | null
    applicantKycVerified: boolean
    applicantKycVerifiedAt: Date | null
    applicantAddress: JsonValue | null
    applicantAddressEnc: string | null
    businessInfo: JsonValue | null
    collateral: JsonValue | null
    metadata: JsonValue
    submittedAt: Date
    createdAt: Date
    updatedAt: Date
    idempotencyKey: string | null
    piiKeyVersion: string
    _count: LoanRequestCountAggregateOutputType | null
    _avg: LoanRequestAvgAggregateOutputType | null
    _sum: LoanRequestSumAggregateOutputType | null
    _min: LoanRequestMinAggregateOutputType | null
    _max: LoanRequestMaxAggregateOutputType | null
  }

  type GetLoanRequestGroupByPayload<T extends LoanRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LoanRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LoanRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LoanRequestGroupByOutputType[P]>
            : GetScalarType<T[P], LoanRequestGroupByOutputType[P]>
        }
      >
    >


  export type LoanRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    status?: boolean
    loanType?: boolean
    requestedAmount?: boolean
    requestedTermMonths?: boolean
    purpose?: boolean
    applicantId?: boolean
    applicantFirstName?: boolean
    applicantLastName?: boolean
    applicantEmail?: boolean
    applicantPhone?: boolean
    applicantDateOfBirth?: boolean
    applicantNationalId?: boolean
    applicantEmploymentStatus?: boolean
    applicantAnnualIncome?: boolean
    applicantCreditScore?: boolean
    applicantExistingDebt?: boolean
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: boolean
    applicantAddress?: boolean
    applicantAddressEnc?: boolean
    businessInfo?: boolean
    collateral?: boolean
    metadata?: boolean
    submittedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    idempotencyKey?: boolean
    piiKeyVersion?: boolean
  }, ExtArgs["result"]["loanRequest"]>

  export type LoanRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    status?: boolean
    loanType?: boolean
    requestedAmount?: boolean
    requestedTermMonths?: boolean
    purpose?: boolean
    applicantId?: boolean
    applicantFirstName?: boolean
    applicantLastName?: boolean
    applicantEmail?: boolean
    applicantPhone?: boolean
    applicantDateOfBirth?: boolean
    applicantNationalId?: boolean
    applicantEmploymentStatus?: boolean
    applicantAnnualIncome?: boolean
    applicantCreditScore?: boolean
    applicantExistingDebt?: boolean
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: boolean
    applicantAddress?: boolean
    applicantAddressEnc?: boolean
    businessInfo?: boolean
    collateral?: boolean
    metadata?: boolean
    submittedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    idempotencyKey?: boolean
    piiKeyVersion?: boolean
  }, ExtArgs["result"]["loanRequest"]>

  export type LoanRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    status?: boolean
    loanType?: boolean
    requestedAmount?: boolean
    requestedTermMonths?: boolean
    purpose?: boolean
    applicantId?: boolean
    applicantFirstName?: boolean
    applicantLastName?: boolean
    applicantEmail?: boolean
    applicantPhone?: boolean
    applicantDateOfBirth?: boolean
    applicantNationalId?: boolean
    applicantEmploymentStatus?: boolean
    applicantAnnualIncome?: boolean
    applicantCreditScore?: boolean
    applicantExistingDebt?: boolean
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: boolean
    applicantAddress?: boolean
    applicantAddressEnc?: boolean
    businessInfo?: boolean
    collateral?: boolean
    metadata?: boolean
    submittedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    idempotencyKey?: boolean
    piiKeyVersion?: boolean
  }, ExtArgs["result"]["loanRequest"]>

  export type LoanRequestSelectScalar = {
    id?: boolean
    tenantId?: boolean
    status?: boolean
    loanType?: boolean
    requestedAmount?: boolean
    requestedTermMonths?: boolean
    purpose?: boolean
    applicantId?: boolean
    applicantFirstName?: boolean
    applicantLastName?: boolean
    applicantEmail?: boolean
    applicantPhone?: boolean
    applicantDateOfBirth?: boolean
    applicantNationalId?: boolean
    applicantEmploymentStatus?: boolean
    applicantAnnualIncome?: boolean
    applicantCreditScore?: boolean
    applicantExistingDebt?: boolean
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: boolean
    applicantAddress?: boolean
    applicantAddressEnc?: boolean
    businessInfo?: boolean
    collateral?: boolean
    metadata?: boolean
    submittedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    idempotencyKey?: boolean
    piiKeyVersion?: boolean
  }

  export type LoanRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "status" | "loanType" | "requestedAmount" | "requestedTermMonths" | "purpose" | "applicantId" | "applicantFirstName" | "applicantLastName" | "applicantEmail" | "applicantPhone" | "applicantDateOfBirth" | "applicantNationalId" | "applicantEmploymentStatus" | "applicantAnnualIncome" | "applicantCreditScore" | "applicantExistingDebt" | "applicantKycVerified" | "applicantKycVerifiedAt" | "applicantAddress" | "applicantAddressEnc" | "businessInfo" | "collateral" | "metadata" | "submittedAt" | "createdAt" | "updatedAt" | "idempotencyKey" | "piiKeyVersion", ExtArgs["result"]["loanRequest"]>

  export type $LoanRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LoanRequest"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      status: string
      loanType: string
      requestedAmount: Prisma.Decimal
      requestedTermMonths: number
      purpose: string
      applicantId: string
      applicantFirstName: string
      applicantLastName: string
      applicantEmail: string
      applicantPhone: string | null
      applicantDateOfBirth: Date | null
      applicantNationalId: string | null
      applicantEmploymentStatus: string | null
      applicantAnnualIncome: Prisma.Decimal | null
      applicantCreditScore: number | null
      applicantExistingDebt: Prisma.Decimal | null
      applicantKycVerified: boolean
      applicantKycVerifiedAt: Date | null
      applicantAddress: Prisma.JsonValue | null
      applicantAddressEnc: string | null
      businessInfo: Prisma.JsonValue | null
      collateral: Prisma.JsonValue | null
      metadata: Prisma.JsonValue
      submittedAt: Date
      createdAt: Date
      updatedAt: Date
      idempotencyKey: string | null
      piiKeyVersion: string
    }, ExtArgs["result"]["loanRequest"]>
    composites: {}
  }

  type LoanRequestGetPayload<S extends boolean | null | undefined | LoanRequestDefaultArgs> = $Result.GetResult<Prisma.$LoanRequestPayload, S>

  type LoanRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LoanRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LoanRequestCountAggregateInputType | true
    }

  export interface LoanRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LoanRequest'], meta: { name: 'LoanRequest' } }
    /**
     * Find zero or one LoanRequest that matches the filter.
     * @param {LoanRequestFindUniqueArgs} args - Arguments to find a LoanRequest
     * @example
     * // Get one LoanRequest
     * const loanRequest = await prisma.loanRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LoanRequestFindUniqueArgs>(args: SelectSubset<T, LoanRequestFindUniqueArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LoanRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LoanRequestFindUniqueOrThrowArgs} args - Arguments to find a LoanRequest
     * @example
     * // Get one LoanRequest
     * const loanRequest = await prisma.loanRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LoanRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, LoanRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LoanRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestFindFirstArgs} args - Arguments to find a LoanRequest
     * @example
     * // Get one LoanRequest
     * const loanRequest = await prisma.loanRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LoanRequestFindFirstArgs>(args?: SelectSubset<T, LoanRequestFindFirstArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LoanRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestFindFirstOrThrowArgs} args - Arguments to find a LoanRequest
     * @example
     * // Get one LoanRequest
     * const loanRequest = await prisma.loanRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LoanRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, LoanRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LoanRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LoanRequests
     * const loanRequests = await prisma.loanRequest.findMany()
     * 
     * // Get first 10 LoanRequests
     * const loanRequests = await prisma.loanRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const loanRequestWithIdOnly = await prisma.loanRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LoanRequestFindManyArgs>(args?: SelectSubset<T, LoanRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LoanRequest.
     * @param {LoanRequestCreateArgs} args - Arguments to create a LoanRequest.
     * @example
     * // Create one LoanRequest
     * const LoanRequest = await prisma.loanRequest.create({
     *   data: {
     *     // ... data to create a LoanRequest
     *   }
     * })
     * 
     */
    create<T extends LoanRequestCreateArgs>(args: SelectSubset<T, LoanRequestCreateArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LoanRequests.
     * @param {LoanRequestCreateManyArgs} args - Arguments to create many LoanRequests.
     * @example
     * // Create many LoanRequests
     * const loanRequest = await prisma.loanRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LoanRequestCreateManyArgs>(args?: SelectSubset<T, LoanRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LoanRequests and returns the data saved in the database.
     * @param {LoanRequestCreateManyAndReturnArgs} args - Arguments to create many LoanRequests.
     * @example
     * // Create many LoanRequests
     * const loanRequest = await prisma.loanRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LoanRequests and only return the `id`
     * const loanRequestWithIdOnly = await prisma.loanRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LoanRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, LoanRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LoanRequest.
     * @param {LoanRequestDeleteArgs} args - Arguments to delete one LoanRequest.
     * @example
     * // Delete one LoanRequest
     * const LoanRequest = await prisma.loanRequest.delete({
     *   where: {
     *     // ... filter to delete one LoanRequest
     *   }
     * })
     * 
     */
    delete<T extends LoanRequestDeleteArgs>(args: SelectSubset<T, LoanRequestDeleteArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LoanRequest.
     * @param {LoanRequestUpdateArgs} args - Arguments to update one LoanRequest.
     * @example
     * // Update one LoanRequest
     * const loanRequest = await prisma.loanRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LoanRequestUpdateArgs>(args: SelectSubset<T, LoanRequestUpdateArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LoanRequests.
     * @param {LoanRequestDeleteManyArgs} args - Arguments to filter LoanRequests to delete.
     * @example
     * // Delete a few LoanRequests
     * const { count } = await prisma.loanRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LoanRequestDeleteManyArgs>(args?: SelectSubset<T, LoanRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoanRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LoanRequests
     * const loanRequest = await prisma.loanRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LoanRequestUpdateManyArgs>(args: SelectSubset<T, LoanRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoanRequests and returns the data updated in the database.
     * @param {LoanRequestUpdateManyAndReturnArgs} args - Arguments to update many LoanRequests.
     * @example
     * // Update many LoanRequests
     * const loanRequest = await prisma.loanRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LoanRequests and only return the `id`
     * const loanRequestWithIdOnly = await prisma.loanRequest.updateManyAndReturn({
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
    updateManyAndReturn<T extends LoanRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, LoanRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LoanRequest.
     * @param {LoanRequestUpsertArgs} args - Arguments to update or create a LoanRequest.
     * @example
     * // Update or create a LoanRequest
     * const loanRequest = await prisma.loanRequest.upsert({
     *   create: {
     *     // ... data to create a LoanRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LoanRequest we want to update
     *   }
     * })
     */
    upsert<T extends LoanRequestUpsertArgs>(args: SelectSubset<T, LoanRequestUpsertArgs<ExtArgs>>): Prisma__LoanRequestClient<$Result.GetResult<Prisma.$LoanRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LoanRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestCountArgs} args - Arguments to filter LoanRequests to count.
     * @example
     * // Count the number of LoanRequests
     * const count = await prisma.loanRequest.count({
     *   where: {
     *     // ... the filter for the LoanRequests we want to count
     *   }
     * })
    **/
    count<T extends LoanRequestCountArgs>(
      args?: Subset<T, LoanRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LoanRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LoanRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LoanRequestAggregateArgs>(args: Subset<T, LoanRequestAggregateArgs>): Prisma.PrismaPromise<GetLoanRequestAggregateType<T>>

    /**
     * Group by LoanRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoanRequestGroupByArgs} args - Group by arguments.
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
      T extends LoanRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LoanRequestGroupByArgs['orderBy'] }
        : { orderBy?: LoanRequestGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, LoanRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLoanRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LoanRequest model
   */
  readonly fields: LoanRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LoanRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LoanRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the LoanRequest model
   */
  interface LoanRequestFieldRefs {
    readonly id: FieldRef<"LoanRequest", 'String'>
    readonly tenantId: FieldRef<"LoanRequest", 'String'>
    readonly status: FieldRef<"LoanRequest", 'String'>
    readonly loanType: FieldRef<"LoanRequest", 'String'>
    readonly requestedAmount: FieldRef<"LoanRequest", 'Decimal'>
    readonly requestedTermMonths: FieldRef<"LoanRequest", 'Int'>
    readonly purpose: FieldRef<"LoanRequest", 'String'>
    readonly applicantId: FieldRef<"LoanRequest", 'String'>
    readonly applicantFirstName: FieldRef<"LoanRequest", 'String'>
    readonly applicantLastName: FieldRef<"LoanRequest", 'String'>
    readonly applicantEmail: FieldRef<"LoanRequest", 'String'>
    readonly applicantPhone: FieldRef<"LoanRequest", 'String'>
    readonly applicantDateOfBirth: FieldRef<"LoanRequest", 'DateTime'>
    readonly applicantNationalId: FieldRef<"LoanRequest", 'String'>
    readonly applicantEmploymentStatus: FieldRef<"LoanRequest", 'String'>
    readonly applicantAnnualIncome: FieldRef<"LoanRequest", 'Decimal'>
    readonly applicantCreditScore: FieldRef<"LoanRequest", 'Int'>
    readonly applicantExistingDebt: FieldRef<"LoanRequest", 'Decimal'>
    readonly applicantKycVerified: FieldRef<"LoanRequest", 'Boolean'>
    readonly applicantKycVerifiedAt: FieldRef<"LoanRequest", 'DateTime'>
    readonly applicantAddress: FieldRef<"LoanRequest", 'Json'>
    readonly applicantAddressEnc: FieldRef<"LoanRequest", 'String'>
    readonly businessInfo: FieldRef<"LoanRequest", 'Json'>
    readonly collateral: FieldRef<"LoanRequest", 'Json'>
    readonly metadata: FieldRef<"LoanRequest", 'Json'>
    readonly submittedAt: FieldRef<"LoanRequest", 'DateTime'>
    readonly createdAt: FieldRef<"LoanRequest", 'DateTime'>
    readonly updatedAt: FieldRef<"LoanRequest", 'DateTime'>
    readonly idempotencyKey: FieldRef<"LoanRequest", 'String'>
    readonly piiKeyVersion: FieldRef<"LoanRequest", 'String'>
  }
    

  // Custom InputTypes
  /**
   * LoanRequest findUnique
   */
  export type LoanRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * Filter, which LoanRequest to fetch.
     */
    where: LoanRequestWhereUniqueInput
  }

  /**
   * LoanRequest findUniqueOrThrow
   */
  export type LoanRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * Filter, which LoanRequest to fetch.
     */
    where: LoanRequestWhereUniqueInput
  }

  /**
   * LoanRequest findFirst
   */
  export type LoanRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * Filter, which LoanRequest to fetch.
     */
    where?: LoanRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoanRequests to fetch.
     */
    orderBy?: LoanRequestOrderByWithRelationInput | LoanRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoanRequests.
     */
    cursor?: LoanRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoanRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoanRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoanRequests.
     */
    distinct?: LoanRequestScalarFieldEnum | LoanRequestScalarFieldEnum[]
  }

  /**
   * LoanRequest findFirstOrThrow
   */
  export type LoanRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * Filter, which LoanRequest to fetch.
     */
    where?: LoanRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoanRequests to fetch.
     */
    orderBy?: LoanRequestOrderByWithRelationInput | LoanRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoanRequests.
     */
    cursor?: LoanRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoanRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoanRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoanRequests.
     */
    distinct?: LoanRequestScalarFieldEnum | LoanRequestScalarFieldEnum[]
  }

  /**
   * LoanRequest findMany
   */
  export type LoanRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * Filter, which LoanRequests to fetch.
     */
    where?: LoanRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoanRequests to fetch.
     */
    orderBy?: LoanRequestOrderByWithRelationInput | LoanRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LoanRequests.
     */
    cursor?: LoanRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoanRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoanRequests.
     */
    skip?: number
    distinct?: LoanRequestScalarFieldEnum | LoanRequestScalarFieldEnum[]
  }

  /**
   * LoanRequest create
   */
  export type LoanRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * The data needed to create a LoanRequest.
     */
    data: XOR<LoanRequestCreateInput, LoanRequestUncheckedCreateInput>
  }

  /**
   * LoanRequest createMany
   */
  export type LoanRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LoanRequests.
     */
    data: LoanRequestCreateManyInput | LoanRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LoanRequest createManyAndReturn
   */
  export type LoanRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * The data used to create many LoanRequests.
     */
    data: LoanRequestCreateManyInput | LoanRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LoanRequest update
   */
  export type LoanRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * The data needed to update a LoanRequest.
     */
    data: XOR<LoanRequestUpdateInput, LoanRequestUncheckedUpdateInput>
    /**
     * Choose, which LoanRequest to update.
     */
    where: LoanRequestWhereUniqueInput
  }

  /**
   * LoanRequest updateMany
   */
  export type LoanRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LoanRequests.
     */
    data: XOR<LoanRequestUpdateManyMutationInput, LoanRequestUncheckedUpdateManyInput>
    /**
     * Filter which LoanRequests to update
     */
    where?: LoanRequestWhereInput
    /**
     * Limit how many LoanRequests to update.
     */
    limit?: number
  }

  /**
   * LoanRequest updateManyAndReturn
   */
  export type LoanRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * The data used to update LoanRequests.
     */
    data: XOR<LoanRequestUpdateManyMutationInput, LoanRequestUncheckedUpdateManyInput>
    /**
     * Filter which LoanRequests to update
     */
    where?: LoanRequestWhereInput
    /**
     * Limit how many LoanRequests to update.
     */
    limit?: number
  }

  /**
   * LoanRequest upsert
   */
  export type LoanRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * The filter to search for the LoanRequest to update in case it exists.
     */
    where: LoanRequestWhereUniqueInput
    /**
     * In case the LoanRequest found by the `where` argument doesn't exist, create a new LoanRequest with this data.
     */
    create: XOR<LoanRequestCreateInput, LoanRequestUncheckedCreateInput>
    /**
     * In case the LoanRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LoanRequestUpdateInput, LoanRequestUncheckedUpdateInput>
  }

  /**
   * LoanRequest delete
   */
  export type LoanRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
    /**
     * Filter which LoanRequest to delete.
     */
    where: LoanRequestWhereUniqueInput
  }

  /**
   * LoanRequest deleteMany
   */
  export type LoanRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoanRequests to delete
     */
    where?: LoanRequestWhereInput
    /**
     * Limit how many LoanRequests to delete.
     */
    limit?: number
  }

  /**
   * LoanRequest without action
   */
  export type LoanRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoanRequest
     */
    select?: LoanRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LoanRequest
     */
    omit?: LoanRequestOmit<ExtArgs> | null
  }


  /**
   * Model WorkflowRun
   */

  export type AggregateWorkflowRun = {
    _count: WorkflowRunCountAggregateOutputType | null
    _min: WorkflowRunMinAggregateOutputType | null
    _max: WorkflowRunMaxAggregateOutputType | null
  }

  export type WorkflowRunMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    loanRequestId: string | null
    temporalWorkflowId: string | null
    temporalRunId: string | null
    status: string | null
    currentStep: string | null
    loanStatus: string | null
    policyVersion: string | null
    aiModelVersion: string | null
    fraudModelVersion: string | null
    traceId: string | null
    correlationId: string | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WorkflowRunMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    loanRequestId: string | null
    temporalWorkflowId: string | null
    temporalRunId: string | null
    status: string | null
    currentStep: string | null
    loanStatus: string | null
    policyVersion: string | null
    aiModelVersion: string | null
    fraudModelVersion: string | null
    traceId: string | null
    correlationId: string | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WorkflowRunCountAggregateOutputType = {
    id: number
    tenantId: number
    loanRequestId: number
    temporalWorkflowId: number
    temporalRunId: number
    status: number
    currentStep: number
    loanStatus: number
    policyVersion: number
    aiModelVersion: number
    fraudModelVersion: number
    traceId: number
    correlationId: number
    steps: number
    errorDetails: number
    startedAt: number
    completedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WorkflowRunMinAggregateInputType = {
    id?: true
    tenantId?: true
    loanRequestId?: true
    temporalWorkflowId?: true
    temporalRunId?: true
    status?: true
    currentStep?: true
    loanStatus?: true
    policyVersion?: true
    aiModelVersion?: true
    fraudModelVersion?: true
    traceId?: true
    correlationId?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WorkflowRunMaxAggregateInputType = {
    id?: true
    tenantId?: true
    loanRequestId?: true
    temporalWorkflowId?: true
    temporalRunId?: true
    status?: true
    currentStep?: true
    loanStatus?: true
    policyVersion?: true
    aiModelVersion?: true
    fraudModelVersion?: true
    traceId?: true
    correlationId?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WorkflowRunCountAggregateInputType = {
    id?: true
    tenantId?: true
    loanRequestId?: true
    temporalWorkflowId?: true
    temporalRunId?: true
    status?: true
    currentStep?: true
    loanStatus?: true
    policyVersion?: true
    aiModelVersion?: true
    fraudModelVersion?: true
    traceId?: true
    correlationId?: true
    steps?: true
    errorDetails?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WorkflowRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkflowRun to aggregate.
     */
    where?: WorkflowRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkflowRuns to fetch.
     */
    orderBy?: WorkflowRunOrderByWithRelationInput | WorkflowRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkflowRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkflowRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkflowRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkflowRuns
    **/
    _count?: true | WorkflowRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkflowRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkflowRunMaxAggregateInputType
  }

  export type GetWorkflowRunAggregateType<T extends WorkflowRunAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkflowRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkflowRun[P]>
      : GetScalarType<T[P], AggregateWorkflowRun[P]>
  }




  export type WorkflowRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkflowRunWhereInput
    orderBy?: WorkflowRunOrderByWithAggregationInput | WorkflowRunOrderByWithAggregationInput[]
    by: WorkflowRunScalarFieldEnum[] | WorkflowRunScalarFieldEnum
    having?: WorkflowRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkflowRunCountAggregateInputType | true
    _min?: WorkflowRunMinAggregateInputType
    _max?: WorkflowRunMaxAggregateInputType
  }

  export type WorkflowRunGroupByOutputType = {
    id: string
    tenantId: string
    loanRequestId: string
    temporalWorkflowId: string
    temporalRunId: string
    status: string
    currentStep: string | null
    loanStatus: string | null
    policyVersion: string | null
    aiModelVersion: string | null
    fraudModelVersion: string | null
    traceId: string | null
    correlationId: string | null
    steps: JsonValue
    errorDetails: JsonValue | null
    startedAt: Date
    completedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: WorkflowRunCountAggregateOutputType | null
    _min: WorkflowRunMinAggregateOutputType | null
    _max: WorkflowRunMaxAggregateOutputType | null
  }

  type GetWorkflowRunGroupByPayload<T extends WorkflowRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkflowRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkflowRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkflowRunGroupByOutputType[P]>
            : GetScalarType<T[P], WorkflowRunGroupByOutputType[P]>
        }
      >
    >


  export type WorkflowRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    temporalWorkflowId?: boolean
    temporalRunId?: boolean
    status?: boolean
    currentStep?: boolean
    loanStatus?: boolean
    policyVersion?: boolean
    aiModelVersion?: boolean
    fraudModelVersion?: boolean
    traceId?: boolean
    correlationId?: boolean
    steps?: boolean
    errorDetails?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["workflowRun"]>

  export type WorkflowRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    temporalWorkflowId?: boolean
    temporalRunId?: boolean
    status?: boolean
    currentStep?: boolean
    loanStatus?: boolean
    policyVersion?: boolean
    aiModelVersion?: boolean
    fraudModelVersion?: boolean
    traceId?: boolean
    correlationId?: boolean
    steps?: boolean
    errorDetails?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["workflowRun"]>

  export type WorkflowRunSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    temporalWorkflowId?: boolean
    temporalRunId?: boolean
    status?: boolean
    currentStep?: boolean
    loanStatus?: boolean
    policyVersion?: boolean
    aiModelVersion?: boolean
    fraudModelVersion?: boolean
    traceId?: boolean
    correlationId?: boolean
    steps?: boolean
    errorDetails?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["workflowRun"]>

  export type WorkflowRunSelectScalar = {
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    temporalWorkflowId?: boolean
    temporalRunId?: boolean
    status?: boolean
    currentStep?: boolean
    loanStatus?: boolean
    policyVersion?: boolean
    aiModelVersion?: boolean
    fraudModelVersion?: boolean
    traceId?: boolean
    correlationId?: boolean
    steps?: boolean
    errorDetails?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WorkflowRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "loanRequestId" | "temporalWorkflowId" | "temporalRunId" | "status" | "currentStep" | "loanStatus" | "policyVersion" | "aiModelVersion" | "fraudModelVersion" | "traceId" | "correlationId" | "steps" | "errorDetails" | "startedAt" | "completedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["workflowRun"]>

  export type $WorkflowRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkflowRun"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      loanRequestId: string
      temporalWorkflowId: string
      temporalRunId: string
      status: string
      currentStep: string | null
      loanStatus: string | null
      policyVersion: string | null
      aiModelVersion: string | null
      fraudModelVersion: string | null
      traceId: string | null
      correlationId: string | null
      steps: Prisma.JsonValue
      errorDetails: Prisma.JsonValue | null
      startedAt: Date
      completedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["workflowRun"]>
    composites: {}
  }

  type WorkflowRunGetPayload<S extends boolean | null | undefined | WorkflowRunDefaultArgs> = $Result.GetResult<Prisma.$WorkflowRunPayload, S>

  type WorkflowRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkflowRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkflowRunCountAggregateInputType | true
    }

  export interface WorkflowRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkflowRun'], meta: { name: 'WorkflowRun' } }
    /**
     * Find zero or one WorkflowRun that matches the filter.
     * @param {WorkflowRunFindUniqueArgs} args - Arguments to find a WorkflowRun
     * @example
     * // Get one WorkflowRun
     * const workflowRun = await prisma.workflowRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkflowRunFindUniqueArgs>(args: SelectSubset<T, WorkflowRunFindUniqueArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WorkflowRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkflowRunFindUniqueOrThrowArgs} args - Arguments to find a WorkflowRun
     * @example
     * // Get one WorkflowRun
     * const workflowRun = await prisma.workflowRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkflowRunFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkflowRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkflowRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunFindFirstArgs} args - Arguments to find a WorkflowRun
     * @example
     * // Get one WorkflowRun
     * const workflowRun = await prisma.workflowRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkflowRunFindFirstArgs>(args?: SelectSubset<T, WorkflowRunFindFirstArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkflowRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunFindFirstOrThrowArgs} args - Arguments to find a WorkflowRun
     * @example
     * // Get one WorkflowRun
     * const workflowRun = await prisma.workflowRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkflowRunFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkflowRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WorkflowRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkflowRuns
     * const workflowRuns = await prisma.workflowRun.findMany()
     * 
     * // Get first 10 WorkflowRuns
     * const workflowRuns = await prisma.workflowRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workflowRunWithIdOnly = await prisma.workflowRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkflowRunFindManyArgs>(args?: SelectSubset<T, WorkflowRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WorkflowRun.
     * @param {WorkflowRunCreateArgs} args - Arguments to create a WorkflowRun.
     * @example
     * // Create one WorkflowRun
     * const WorkflowRun = await prisma.workflowRun.create({
     *   data: {
     *     // ... data to create a WorkflowRun
     *   }
     * })
     * 
     */
    create<T extends WorkflowRunCreateArgs>(args: SelectSubset<T, WorkflowRunCreateArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WorkflowRuns.
     * @param {WorkflowRunCreateManyArgs} args - Arguments to create many WorkflowRuns.
     * @example
     * // Create many WorkflowRuns
     * const workflowRun = await prisma.workflowRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkflowRunCreateManyArgs>(args?: SelectSubset<T, WorkflowRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkflowRuns and returns the data saved in the database.
     * @param {WorkflowRunCreateManyAndReturnArgs} args - Arguments to create many WorkflowRuns.
     * @example
     * // Create many WorkflowRuns
     * const workflowRun = await prisma.workflowRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkflowRuns and only return the `id`
     * const workflowRunWithIdOnly = await prisma.workflowRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkflowRunCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkflowRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WorkflowRun.
     * @param {WorkflowRunDeleteArgs} args - Arguments to delete one WorkflowRun.
     * @example
     * // Delete one WorkflowRun
     * const WorkflowRun = await prisma.workflowRun.delete({
     *   where: {
     *     // ... filter to delete one WorkflowRun
     *   }
     * })
     * 
     */
    delete<T extends WorkflowRunDeleteArgs>(args: SelectSubset<T, WorkflowRunDeleteArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WorkflowRun.
     * @param {WorkflowRunUpdateArgs} args - Arguments to update one WorkflowRun.
     * @example
     * // Update one WorkflowRun
     * const workflowRun = await prisma.workflowRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkflowRunUpdateArgs>(args: SelectSubset<T, WorkflowRunUpdateArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WorkflowRuns.
     * @param {WorkflowRunDeleteManyArgs} args - Arguments to filter WorkflowRuns to delete.
     * @example
     * // Delete a few WorkflowRuns
     * const { count } = await prisma.workflowRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkflowRunDeleteManyArgs>(args?: SelectSubset<T, WorkflowRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkflowRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkflowRuns
     * const workflowRun = await prisma.workflowRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkflowRunUpdateManyArgs>(args: SelectSubset<T, WorkflowRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkflowRuns and returns the data updated in the database.
     * @param {WorkflowRunUpdateManyAndReturnArgs} args - Arguments to update many WorkflowRuns.
     * @example
     * // Update many WorkflowRuns
     * const workflowRun = await prisma.workflowRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WorkflowRuns and only return the `id`
     * const workflowRunWithIdOnly = await prisma.workflowRun.updateManyAndReturn({
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
    updateManyAndReturn<T extends WorkflowRunUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkflowRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WorkflowRun.
     * @param {WorkflowRunUpsertArgs} args - Arguments to update or create a WorkflowRun.
     * @example
     * // Update or create a WorkflowRun
     * const workflowRun = await prisma.workflowRun.upsert({
     *   create: {
     *     // ... data to create a WorkflowRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkflowRun we want to update
     *   }
     * })
     */
    upsert<T extends WorkflowRunUpsertArgs>(args: SelectSubset<T, WorkflowRunUpsertArgs<ExtArgs>>): Prisma__WorkflowRunClient<$Result.GetResult<Prisma.$WorkflowRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WorkflowRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunCountArgs} args - Arguments to filter WorkflowRuns to count.
     * @example
     * // Count the number of WorkflowRuns
     * const count = await prisma.workflowRun.count({
     *   where: {
     *     // ... the filter for the WorkflowRuns we want to count
     *   }
     * })
    **/
    count<T extends WorkflowRunCountArgs>(
      args?: Subset<T, WorkflowRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkflowRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkflowRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkflowRunAggregateArgs>(args: Subset<T, WorkflowRunAggregateArgs>): Prisma.PrismaPromise<GetWorkflowRunAggregateType<T>>

    /**
     * Group by WorkflowRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkflowRunGroupByArgs} args - Group by arguments.
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
      T extends WorkflowRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkflowRunGroupByArgs['orderBy'] }
        : { orderBy?: WorkflowRunGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkflowRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkflowRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkflowRun model
   */
  readonly fields: WorkflowRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkflowRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkflowRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the WorkflowRun model
   */
  interface WorkflowRunFieldRefs {
    readonly id: FieldRef<"WorkflowRun", 'String'>
    readonly tenantId: FieldRef<"WorkflowRun", 'String'>
    readonly loanRequestId: FieldRef<"WorkflowRun", 'String'>
    readonly temporalWorkflowId: FieldRef<"WorkflowRun", 'String'>
    readonly temporalRunId: FieldRef<"WorkflowRun", 'String'>
    readonly status: FieldRef<"WorkflowRun", 'String'>
    readonly currentStep: FieldRef<"WorkflowRun", 'String'>
    readonly loanStatus: FieldRef<"WorkflowRun", 'String'>
    readonly policyVersion: FieldRef<"WorkflowRun", 'String'>
    readonly aiModelVersion: FieldRef<"WorkflowRun", 'String'>
    readonly fraudModelVersion: FieldRef<"WorkflowRun", 'String'>
    readonly traceId: FieldRef<"WorkflowRun", 'String'>
    readonly correlationId: FieldRef<"WorkflowRun", 'String'>
    readonly steps: FieldRef<"WorkflowRun", 'Json'>
    readonly errorDetails: FieldRef<"WorkflowRun", 'Json'>
    readonly startedAt: FieldRef<"WorkflowRun", 'DateTime'>
    readonly completedAt: FieldRef<"WorkflowRun", 'DateTime'>
    readonly createdAt: FieldRef<"WorkflowRun", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkflowRun", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WorkflowRun findUnique
   */
  export type WorkflowRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * Filter, which WorkflowRun to fetch.
     */
    where: WorkflowRunWhereUniqueInput
  }

  /**
   * WorkflowRun findUniqueOrThrow
   */
  export type WorkflowRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * Filter, which WorkflowRun to fetch.
     */
    where: WorkflowRunWhereUniqueInput
  }

  /**
   * WorkflowRun findFirst
   */
  export type WorkflowRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * Filter, which WorkflowRun to fetch.
     */
    where?: WorkflowRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkflowRuns to fetch.
     */
    orderBy?: WorkflowRunOrderByWithRelationInput | WorkflowRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkflowRuns.
     */
    cursor?: WorkflowRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkflowRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkflowRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkflowRuns.
     */
    distinct?: WorkflowRunScalarFieldEnum | WorkflowRunScalarFieldEnum[]
  }

  /**
   * WorkflowRun findFirstOrThrow
   */
  export type WorkflowRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * Filter, which WorkflowRun to fetch.
     */
    where?: WorkflowRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkflowRuns to fetch.
     */
    orderBy?: WorkflowRunOrderByWithRelationInput | WorkflowRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkflowRuns.
     */
    cursor?: WorkflowRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkflowRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkflowRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkflowRuns.
     */
    distinct?: WorkflowRunScalarFieldEnum | WorkflowRunScalarFieldEnum[]
  }

  /**
   * WorkflowRun findMany
   */
  export type WorkflowRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * Filter, which WorkflowRuns to fetch.
     */
    where?: WorkflowRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkflowRuns to fetch.
     */
    orderBy?: WorkflowRunOrderByWithRelationInput | WorkflowRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkflowRuns.
     */
    cursor?: WorkflowRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkflowRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkflowRuns.
     */
    skip?: number
    distinct?: WorkflowRunScalarFieldEnum | WorkflowRunScalarFieldEnum[]
  }

  /**
   * WorkflowRun create
   */
  export type WorkflowRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * The data needed to create a WorkflowRun.
     */
    data: XOR<WorkflowRunCreateInput, WorkflowRunUncheckedCreateInput>
  }

  /**
   * WorkflowRun createMany
   */
  export type WorkflowRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkflowRuns.
     */
    data: WorkflowRunCreateManyInput | WorkflowRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkflowRun createManyAndReturn
   */
  export type WorkflowRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * The data used to create many WorkflowRuns.
     */
    data: WorkflowRunCreateManyInput | WorkflowRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkflowRun update
   */
  export type WorkflowRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * The data needed to update a WorkflowRun.
     */
    data: XOR<WorkflowRunUpdateInput, WorkflowRunUncheckedUpdateInput>
    /**
     * Choose, which WorkflowRun to update.
     */
    where: WorkflowRunWhereUniqueInput
  }

  /**
   * WorkflowRun updateMany
   */
  export type WorkflowRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkflowRuns.
     */
    data: XOR<WorkflowRunUpdateManyMutationInput, WorkflowRunUncheckedUpdateManyInput>
    /**
     * Filter which WorkflowRuns to update
     */
    where?: WorkflowRunWhereInput
    /**
     * Limit how many WorkflowRuns to update.
     */
    limit?: number
  }

  /**
   * WorkflowRun updateManyAndReturn
   */
  export type WorkflowRunUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * The data used to update WorkflowRuns.
     */
    data: XOR<WorkflowRunUpdateManyMutationInput, WorkflowRunUncheckedUpdateManyInput>
    /**
     * Filter which WorkflowRuns to update
     */
    where?: WorkflowRunWhereInput
    /**
     * Limit how many WorkflowRuns to update.
     */
    limit?: number
  }

  /**
   * WorkflowRun upsert
   */
  export type WorkflowRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * The filter to search for the WorkflowRun to update in case it exists.
     */
    where: WorkflowRunWhereUniqueInput
    /**
     * In case the WorkflowRun found by the `where` argument doesn't exist, create a new WorkflowRun with this data.
     */
    create: XOR<WorkflowRunCreateInput, WorkflowRunUncheckedCreateInput>
    /**
     * In case the WorkflowRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkflowRunUpdateInput, WorkflowRunUncheckedUpdateInput>
  }

  /**
   * WorkflowRun delete
   */
  export type WorkflowRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
    /**
     * Filter which WorkflowRun to delete.
     */
    where: WorkflowRunWhereUniqueInput
  }

  /**
   * WorkflowRun deleteMany
   */
  export type WorkflowRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkflowRuns to delete
     */
    where?: WorkflowRunWhereInput
    /**
     * Limit how many WorkflowRuns to delete.
     */
    limit?: number
  }

  /**
   * WorkflowRun without action
   */
  export type WorkflowRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkflowRun
     */
    select?: WorkflowRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkflowRun
     */
    omit?: WorkflowRunOmit<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    loanRequestId: string | null
    workflowRunId: string | null
    eventType: string | null
    actorId: string | null
    actorType: string | null
    serviceName: string | null
    traceId: string | null
    spanId: string | null
    correlationId: string | null
    version: string | null
    environment: string | null
    userAgent: string | null
    hash: string | null
    previousHash: string | null
    signature: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    loanRequestId: string | null
    workflowRunId: string | null
    eventType: string | null
    actorId: string | null
    actorType: string | null
    serviceName: string | null
    traceId: string | null
    spanId: string | null
    correlationId: string | null
    version: string | null
    environment: string | null
    userAgent: string | null
    hash: string | null
    previousHash: string | null
    signature: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    tenantId: number
    loanRequestId: number
    workflowRunId: number
    eventType: number
    actorId: number
    actorType: number
    serviceName: number
    payload: number
    traceId: number
    spanId: number
    correlationId: number
    version: number
    environment: number
    userAgent: number
    hash: number
    previousHash: number
    signature: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    tenantId?: true
    loanRequestId?: true
    workflowRunId?: true
    eventType?: true
    actorId?: true
    actorType?: true
    serviceName?: true
    traceId?: true
    spanId?: true
    correlationId?: true
    version?: true
    environment?: true
    userAgent?: true
    hash?: true
    previousHash?: true
    signature?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    tenantId?: true
    loanRequestId?: true
    workflowRunId?: true
    eventType?: true
    actorId?: true
    actorType?: true
    serviceName?: true
    traceId?: true
    spanId?: true
    correlationId?: true
    version?: true
    environment?: true
    userAgent?: true
    hash?: true
    previousHash?: true
    signature?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    tenantId?: true
    loanRequestId?: true
    workflowRunId?: true
    eventType?: true
    actorId?: true
    actorType?: true
    serviceName?: true
    payload?: true
    traceId?: true
    spanId?: true
    correlationId?: true
    version?: true
    environment?: true
    userAgent?: true
    hash?: true
    previousHash?: true
    signature?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    tenantId: string
    loanRequestId: string | null
    workflowRunId: string | null
    eventType: string
    actorId: string | null
    actorType: string
    serviceName: string
    payload: JsonValue
    traceId: string | null
    spanId: string | null
    correlationId: string | null
    version: string
    environment: string | null
    userAgent: string | null
    hash: string
    previousHash: string | null
    signature: string | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    workflowRunId?: boolean
    eventType?: boolean
    actorId?: boolean
    actorType?: boolean
    serviceName?: boolean
    payload?: boolean
    traceId?: boolean
    spanId?: boolean
    correlationId?: boolean
    version?: boolean
    environment?: boolean
    userAgent?: boolean
    hash?: boolean
    previousHash?: boolean
    signature?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    workflowRunId?: boolean
    eventType?: boolean
    actorId?: boolean
    actorType?: boolean
    serviceName?: boolean
    payload?: boolean
    traceId?: boolean
    spanId?: boolean
    correlationId?: boolean
    version?: boolean
    environment?: boolean
    userAgent?: boolean
    hash?: boolean
    previousHash?: boolean
    signature?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    workflowRunId?: boolean
    eventType?: boolean
    actorId?: boolean
    actorType?: boolean
    serviceName?: boolean
    payload?: boolean
    traceId?: boolean
    spanId?: boolean
    correlationId?: boolean
    version?: boolean
    environment?: boolean
    userAgent?: boolean
    hash?: boolean
    previousHash?: boolean
    signature?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    tenantId?: boolean
    loanRequestId?: boolean
    workflowRunId?: boolean
    eventType?: boolean
    actorId?: boolean
    actorType?: boolean
    serviceName?: boolean
    payload?: boolean
    traceId?: boolean
    spanId?: boolean
    correlationId?: boolean
    version?: boolean
    environment?: boolean
    userAgent?: boolean
    hash?: boolean
    previousHash?: boolean
    signature?: boolean
    createdAt?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "loanRequestId" | "workflowRunId" | "eventType" | "actorId" | "actorType" | "serviceName" | "payload" | "traceId" | "spanId" | "correlationId" | "version" | "environment" | "userAgent" | "hash" | "previousHash" | "signature" | "createdAt", ExtArgs["result"]["auditLog"]>

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      loanRequestId: string | null
      workflowRunId: string | null
      eventType: string
      actorId: string | null
      actorType: string
      serviceName: string
      payload: Prisma.JsonValue
      traceId: string | null
      spanId: string | null
      correlationId: string | null
      version: string
      environment: string | null
      userAgent: string | null
      hash: string
      previousHash: string | null
      signature: string | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
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
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
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
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly tenantId: FieldRef<"AuditLog", 'String'>
    readonly loanRequestId: FieldRef<"AuditLog", 'String'>
    readonly workflowRunId: FieldRef<"AuditLog", 'String'>
    readonly eventType: FieldRef<"AuditLog", 'String'>
    readonly actorId: FieldRef<"AuditLog", 'String'>
    readonly actorType: FieldRef<"AuditLog", 'String'>
    readonly serviceName: FieldRef<"AuditLog", 'String'>
    readonly payload: FieldRef<"AuditLog", 'Json'>
    readonly traceId: FieldRef<"AuditLog", 'String'>
    readonly spanId: FieldRef<"AuditLog", 'String'>
    readonly correlationId: FieldRef<"AuditLog", 'String'>
    readonly version: FieldRef<"AuditLog", 'String'>
    readonly environment: FieldRef<"AuditLog", 'String'>
    readonly userAgent: FieldRef<"AuditLog", 'String'>
    readonly hash: FieldRef<"AuditLog", 'String'>
    readonly previousHash: FieldRef<"AuditLog", 'String'>
    readonly signature: FieldRef<"AuditLog", 'String'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
  }


  /**
   * Model DocumentEmbedding
   */

  export type AggregateDocumentEmbedding = {
    _count: DocumentEmbeddingCountAggregateOutputType | null
    _avg: DocumentEmbeddingAvgAggregateOutputType | null
    _sum: DocumentEmbeddingSumAggregateOutputType | null
    _min: DocumentEmbeddingMinAggregateOutputType | null
    _max: DocumentEmbeddingMaxAggregateOutputType | null
  }

  export type DocumentEmbeddingAvgAggregateOutputType = {
    chunkIndex: number | null
  }

  export type DocumentEmbeddingSumAggregateOutputType = {
    chunkIndex: number | null
  }

  export type DocumentEmbeddingMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    documentType: string | null
    source: string | null
    title: string | null
    content: string | null
    chunkIndex: number | null
    createdAt: Date | null
  }

  export type DocumentEmbeddingMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    documentType: string | null
    source: string | null
    title: string | null
    content: string | null
    chunkIndex: number | null
    createdAt: Date | null
  }

  export type DocumentEmbeddingCountAggregateOutputType = {
    id: number
    tenantId: number
    documentType: number
    source: number
    title: number
    content: number
    chunkIndex: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type DocumentEmbeddingAvgAggregateInputType = {
    chunkIndex?: true
  }

  export type DocumentEmbeddingSumAggregateInputType = {
    chunkIndex?: true
  }

  export type DocumentEmbeddingMinAggregateInputType = {
    id?: true
    tenantId?: true
    documentType?: true
    source?: true
    title?: true
    content?: true
    chunkIndex?: true
    createdAt?: true
  }

  export type DocumentEmbeddingMaxAggregateInputType = {
    id?: true
    tenantId?: true
    documentType?: true
    source?: true
    title?: true
    content?: true
    chunkIndex?: true
    createdAt?: true
  }

  export type DocumentEmbeddingCountAggregateInputType = {
    id?: true
    tenantId?: true
    documentType?: true
    source?: true
    title?: true
    content?: true
    chunkIndex?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type DocumentEmbeddingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentEmbedding to aggregate.
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentEmbeddings to fetch.
     */
    orderBy?: DocumentEmbeddingOrderByWithRelationInput | DocumentEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentEmbeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DocumentEmbeddings
    **/
    _count?: true | DocumentEmbeddingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentEmbeddingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentEmbeddingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentEmbeddingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentEmbeddingMaxAggregateInputType
  }

  export type GetDocumentEmbeddingAggregateType<T extends DocumentEmbeddingAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumentEmbedding]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumentEmbedding[P]>
      : GetScalarType<T[P], AggregateDocumentEmbedding[P]>
  }




  export type DocumentEmbeddingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentEmbeddingWhereInput
    orderBy?: DocumentEmbeddingOrderByWithAggregationInput | DocumentEmbeddingOrderByWithAggregationInput[]
    by: DocumentEmbeddingScalarFieldEnum[] | DocumentEmbeddingScalarFieldEnum
    having?: DocumentEmbeddingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentEmbeddingCountAggregateInputType | true
    _avg?: DocumentEmbeddingAvgAggregateInputType
    _sum?: DocumentEmbeddingSumAggregateInputType
    _min?: DocumentEmbeddingMinAggregateInputType
    _max?: DocumentEmbeddingMaxAggregateInputType
  }

  export type DocumentEmbeddingGroupByOutputType = {
    id: string
    tenantId: string
    documentType: string
    source: string | null
    title: string | null
    content: string
    chunkIndex: number
    metadata: JsonValue | null
    createdAt: Date
    _count: DocumentEmbeddingCountAggregateOutputType | null
    _avg: DocumentEmbeddingAvgAggregateOutputType | null
    _sum: DocumentEmbeddingSumAggregateOutputType | null
    _min: DocumentEmbeddingMinAggregateOutputType | null
    _max: DocumentEmbeddingMaxAggregateOutputType | null
  }

  type GetDocumentEmbeddingGroupByPayload<T extends DocumentEmbeddingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentEmbeddingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentEmbeddingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentEmbeddingGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentEmbeddingGroupByOutputType[P]>
        }
      >
    >


  export type DocumentEmbeddingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    documentType?: boolean
    source?: boolean
    title?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["documentEmbedding"]>


  export type DocumentEmbeddingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    documentType?: boolean
    source?: boolean
    title?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["documentEmbedding"]>

  export type DocumentEmbeddingSelectScalar = {
    id?: boolean
    tenantId?: boolean
    documentType?: boolean
    source?: boolean
    title?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type DocumentEmbeddingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "documentType" | "source" | "title" | "content" | "chunkIndex" | "metadata" | "createdAt", ExtArgs["result"]["documentEmbedding"]>

  export type $DocumentEmbeddingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DocumentEmbedding"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      documentType: string
      source: string | null
      title: string | null
      content: string
      chunkIndex: number
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["documentEmbedding"]>
    composites: {}
  }

  type DocumentEmbeddingGetPayload<S extends boolean | null | undefined | DocumentEmbeddingDefaultArgs> = $Result.GetResult<Prisma.$DocumentEmbeddingPayload, S>

  type DocumentEmbeddingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DocumentEmbeddingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DocumentEmbeddingCountAggregateInputType | true
    }

  export interface DocumentEmbeddingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DocumentEmbedding'], meta: { name: 'DocumentEmbedding' } }
    /**
     * Find zero or one DocumentEmbedding that matches the filter.
     * @param {DocumentEmbeddingFindUniqueArgs} args - Arguments to find a DocumentEmbedding
     * @example
     * // Get one DocumentEmbedding
     * const documentEmbedding = await prisma.documentEmbedding.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentEmbeddingFindUniqueArgs>(args: SelectSubset<T, DocumentEmbeddingFindUniqueArgs<ExtArgs>>): Prisma__DocumentEmbeddingClient<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DocumentEmbedding that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentEmbeddingFindUniqueOrThrowArgs} args - Arguments to find a DocumentEmbedding
     * @example
     * // Get one DocumentEmbedding
     * const documentEmbedding = await prisma.documentEmbedding.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentEmbeddingFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentEmbeddingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentEmbeddingClient<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentEmbedding that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingFindFirstArgs} args - Arguments to find a DocumentEmbedding
     * @example
     * // Get one DocumentEmbedding
     * const documentEmbedding = await prisma.documentEmbedding.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentEmbeddingFindFirstArgs>(args?: SelectSubset<T, DocumentEmbeddingFindFirstArgs<ExtArgs>>): Prisma__DocumentEmbeddingClient<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentEmbedding that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingFindFirstOrThrowArgs} args - Arguments to find a DocumentEmbedding
     * @example
     * // Get one DocumentEmbedding
     * const documentEmbedding = await prisma.documentEmbedding.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentEmbeddingFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentEmbeddingFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentEmbeddingClient<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DocumentEmbeddings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DocumentEmbeddings
     * const documentEmbeddings = await prisma.documentEmbedding.findMany()
     * 
     * // Get first 10 DocumentEmbeddings
     * const documentEmbeddings = await prisma.documentEmbedding.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentEmbeddingWithIdOnly = await prisma.documentEmbedding.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentEmbeddingFindManyArgs>(args?: SelectSubset<T, DocumentEmbeddingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Delete a DocumentEmbedding.
     * @param {DocumentEmbeddingDeleteArgs} args - Arguments to delete one DocumentEmbedding.
     * @example
     * // Delete one DocumentEmbedding
     * const DocumentEmbedding = await prisma.documentEmbedding.delete({
     *   where: {
     *     // ... filter to delete one DocumentEmbedding
     *   }
     * })
     * 
     */
    delete<T extends DocumentEmbeddingDeleteArgs>(args: SelectSubset<T, DocumentEmbeddingDeleteArgs<ExtArgs>>): Prisma__DocumentEmbeddingClient<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DocumentEmbedding.
     * @param {DocumentEmbeddingUpdateArgs} args - Arguments to update one DocumentEmbedding.
     * @example
     * // Update one DocumentEmbedding
     * const documentEmbedding = await prisma.documentEmbedding.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentEmbeddingUpdateArgs>(args: SelectSubset<T, DocumentEmbeddingUpdateArgs<ExtArgs>>): Prisma__DocumentEmbeddingClient<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DocumentEmbeddings.
     * @param {DocumentEmbeddingDeleteManyArgs} args - Arguments to filter DocumentEmbeddings to delete.
     * @example
     * // Delete a few DocumentEmbeddings
     * const { count } = await prisma.documentEmbedding.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentEmbeddingDeleteManyArgs>(args?: SelectSubset<T, DocumentEmbeddingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentEmbeddings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DocumentEmbeddings
     * const documentEmbedding = await prisma.documentEmbedding.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentEmbeddingUpdateManyArgs>(args: SelectSubset<T, DocumentEmbeddingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentEmbeddings and returns the data updated in the database.
     * @param {DocumentEmbeddingUpdateManyAndReturnArgs} args - Arguments to update many DocumentEmbeddings.
     * @example
     * // Update many DocumentEmbeddings
     * const documentEmbedding = await prisma.documentEmbedding.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DocumentEmbeddings and only return the `id`
     * const documentEmbeddingWithIdOnly = await prisma.documentEmbedding.updateManyAndReturn({
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
    updateManyAndReturn<T extends DocumentEmbeddingUpdateManyAndReturnArgs>(args: SelectSubset<T, DocumentEmbeddingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentEmbeddingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>


    /**
     * Count the number of DocumentEmbeddings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingCountArgs} args - Arguments to filter DocumentEmbeddings to count.
     * @example
     * // Count the number of DocumentEmbeddings
     * const count = await prisma.documentEmbedding.count({
     *   where: {
     *     // ... the filter for the DocumentEmbeddings we want to count
     *   }
     * })
    **/
    count<T extends DocumentEmbeddingCountArgs>(
      args?: Subset<T, DocumentEmbeddingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentEmbeddingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DocumentEmbedding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentEmbeddingAggregateArgs>(args: Subset<T, DocumentEmbeddingAggregateArgs>): Prisma.PrismaPromise<GetDocumentEmbeddingAggregateType<T>>

    /**
     * Group by DocumentEmbedding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentEmbeddingGroupByArgs} args - Group by arguments.
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
      T extends DocumentEmbeddingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentEmbeddingGroupByArgs['orderBy'] }
        : { orderBy?: DocumentEmbeddingGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentEmbeddingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentEmbeddingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DocumentEmbedding model
   */
  readonly fields: DocumentEmbeddingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DocumentEmbedding.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentEmbeddingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the DocumentEmbedding model
   */
  interface DocumentEmbeddingFieldRefs {
    readonly id: FieldRef<"DocumentEmbedding", 'String'>
    readonly tenantId: FieldRef<"DocumentEmbedding", 'String'>
    readonly documentType: FieldRef<"DocumentEmbedding", 'String'>
    readonly source: FieldRef<"DocumentEmbedding", 'String'>
    readonly title: FieldRef<"DocumentEmbedding", 'String'>
    readonly content: FieldRef<"DocumentEmbedding", 'String'>
    readonly chunkIndex: FieldRef<"DocumentEmbedding", 'Int'>
    readonly metadata: FieldRef<"DocumentEmbedding", 'Json'>
    readonly createdAt: FieldRef<"DocumentEmbedding", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DocumentEmbedding findUnique
   */
  export type DocumentEmbeddingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * Filter, which DocumentEmbedding to fetch.
     */
    where: DocumentEmbeddingWhereUniqueInput
  }

  /**
   * DocumentEmbedding findUniqueOrThrow
   */
  export type DocumentEmbeddingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * Filter, which DocumentEmbedding to fetch.
     */
    where: DocumentEmbeddingWhereUniqueInput
  }

  /**
   * DocumentEmbedding findFirst
   */
  export type DocumentEmbeddingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * Filter, which DocumentEmbedding to fetch.
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentEmbeddings to fetch.
     */
    orderBy?: DocumentEmbeddingOrderByWithRelationInput | DocumentEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentEmbeddings.
     */
    cursor?: DocumentEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentEmbeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentEmbeddings.
     */
    distinct?: DocumentEmbeddingScalarFieldEnum | DocumentEmbeddingScalarFieldEnum[]
  }

  /**
   * DocumentEmbedding findFirstOrThrow
   */
  export type DocumentEmbeddingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * Filter, which DocumentEmbedding to fetch.
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentEmbeddings to fetch.
     */
    orderBy?: DocumentEmbeddingOrderByWithRelationInput | DocumentEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentEmbeddings.
     */
    cursor?: DocumentEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentEmbeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentEmbeddings.
     */
    distinct?: DocumentEmbeddingScalarFieldEnum | DocumentEmbeddingScalarFieldEnum[]
  }

  /**
   * DocumentEmbedding findMany
   */
  export type DocumentEmbeddingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * Filter, which DocumentEmbeddings to fetch.
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentEmbeddings to fetch.
     */
    orderBy?: DocumentEmbeddingOrderByWithRelationInput | DocumentEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DocumentEmbeddings.
     */
    cursor?: DocumentEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentEmbeddings.
     */
    skip?: number
    distinct?: DocumentEmbeddingScalarFieldEnum | DocumentEmbeddingScalarFieldEnum[]
  }

  /**
   * DocumentEmbedding update
   */
  export type DocumentEmbeddingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * The data needed to update a DocumentEmbedding.
     */
    data: XOR<DocumentEmbeddingUpdateInput, DocumentEmbeddingUncheckedUpdateInput>
    /**
     * Choose, which DocumentEmbedding to update.
     */
    where: DocumentEmbeddingWhereUniqueInput
  }

  /**
   * DocumentEmbedding updateMany
   */
  export type DocumentEmbeddingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DocumentEmbeddings.
     */
    data: XOR<DocumentEmbeddingUpdateManyMutationInput, DocumentEmbeddingUncheckedUpdateManyInput>
    /**
     * Filter which DocumentEmbeddings to update
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * Limit how many DocumentEmbeddings to update.
     */
    limit?: number
  }

  /**
   * DocumentEmbedding updateManyAndReturn
   */
  export type DocumentEmbeddingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * The data used to update DocumentEmbeddings.
     */
    data: XOR<DocumentEmbeddingUpdateManyMutationInput, DocumentEmbeddingUncheckedUpdateManyInput>
    /**
     * Filter which DocumentEmbeddings to update
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * Limit how many DocumentEmbeddings to update.
     */
    limit?: number
  }

  /**
   * DocumentEmbedding delete
   */
  export type DocumentEmbeddingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
    /**
     * Filter which DocumentEmbedding to delete.
     */
    where: DocumentEmbeddingWhereUniqueInput
  }

  /**
   * DocumentEmbedding deleteMany
   */
  export type DocumentEmbeddingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentEmbeddings to delete
     */
    where?: DocumentEmbeddingWhereInput
    /**
     * Limit how many DocumentEmbeddings to delete.
     */
    limit?: number
  }

  /**
   * DocumentEmbedding without action
   */
  export type DocumentEmbeddingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentEmbedding
     */
    select?: DocumentEmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentEmbedding
     */
    omit?: DocumentEmbeddingOmit<ExtArgs> | null
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


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    plan: 'plan',
    isActive: 'isActive',
    config: 'config',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    role: 'role',
    passwordHash: 'passwordHash',
    isActive: 'isActive',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const LoanRequestScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    status: 'status',
    loanType: 'loanType',
    requestedAmount: 'requestedAmount',
    requestedTermMonths: 'requestedTermMonths',
    purpose: 'purpose',
    applicantId: 'applicantId',
    applicantFirstName: 'applicantFirstName',
    applicantLastName: 'applicantLastName',
    applicantEmail: 'applicantEmail',
    applicantPhone: 'applicantPhone',
    applicantDateOfBirth: 'applicantDateOfBirth',
    applicantNationalId: 'applicantNationalId',
    applicantEmploymentStatus: 'applicantEmploymentStatus',
    applicantAnnualIncome: 'applicantAnnualIncome',
    applicantCreditScore: 'applicantCreditScore',
    applicantExistingDebt: 'applicantExistingDebt',
    applicantKycVerified: 'applicantKycVerified',
    applicantKycVerifiedAt: 'applicantKycVerifiedAt',
    applicantAddress: 'applicantAddress',
    applicantAddressEnc: 'applicantAddressEnc',
    businessInfo: 'businessInfo',
    collateral: 'collateral',
    metadata: 'metadata',
    submittedAt: 'submittedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    idempotencyKey: 'idempotencyKey',
    piiKeyVersion: 'piiKeyVersion'
  };

  export type LoanRequestScalarFieldEnum = (typeof LoanRequestScalarFieldEnum)[keyof typeof LoanRequestScalarFieldEnum]


  export const WorkflowRunScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    loanRequestId: 'loanRequestId',
    temporalWorkflowId: 'temporalWorkflowId',
    temporalRunId: 'temporalRunId',
    status: 'status',
    currentStep: 'currentStep',
    loanStatus: 'loanStatus',
    policyVersion: 'policyVersion',
    aiModelVersion: 'aiModelVersion',
    fraudModelVersion: 'fraudModelVersion',
    traceId: 'traceId',
    correlationId: 'correlationId',
    steps: 'steps',
    errorDetails: 'errorDetails',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WorkflowRunScalarFieldEnum = (typeof WorkflowRunScalarFieldEnum)[keyof typeof WorkflowRunScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    loanRequestId: 'loanRequestId',
    workflowRunId: 'workflowRunId',
    eventType: 'eventType',
    actorId: 'actorId',
    actorType: 'actorType',
    serviceName: 'serviceName',
    payload: 'payload',
    traceId: 'traceId',
    spanId: 'spanId',
    correlationId: 'correlationId',
    version: 'version',
    environment: 'environment',
    userAgent: 'userAgent',
    hash: 'hash',
    previousHash: 'previousHash',
    signature: 'signature',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const DocumentEmbeddingScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    documentType: 'documentType',
    source: 'source',
    title: 'title',
    content: 'content',
    chunkIndex: 'chunkIndex',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type DocumentEmbeddingScalarFieldEnum = (typeof DocumentEmbeddingScalarFieldEnum)[keyof typeof DocumentEmbeddingScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: UuidFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    plan?: StringFilter<"Tenant"> | string
    isActive?: BoolFilter<"Tenant"> | boolean
    config?: JsonFilter<"Tenant">
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    isActive?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    plan?: StringFilter<"Tenant"> | string
    isActive?: BoolFilter<"Tenant"> | boolean
    config?: JsonFilter<"Tenant">
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
  }, "id" | "slug">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    isActive?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    plan?: StringWithAggregatesFilter<"Tenant"> | string
    isActive?: BoolWithAggregatesFilter<"Tenant"> | boolean
    config?: JsonWithAggregatesFilter<"Tenant">
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    tenantId?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    passwordHash?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    role?: SortOrder
    passwordHash?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_email?: UserTenantIdEmailCompoundUniqueInput
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    tenantId?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    passwordHash?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }, "id" | "tenantId_email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    role?: SortOrder
    passwordHash?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    tenantId?: UuidWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringNullableWithAggregatesFilter<"User"> | string | null
    lastName?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type LoanRequestWhereInput = {
    AND?: LoanRequestWhereInput | LoanRequestWhereInput[]
    OR?: LoanRequestWhereInput[]
    NOT?: LoanRequestWhereInput | LoanRequestWhereInput[]
    id?: UuidFilter<"LoanRequest"> | string
    tenantId?: UuidFilter<"LoanRequest"> | string
    status?: StringFilter<"LoanRequest"> | string
    loanType?: StringFilter<"LoanRequest"> | string
    requestedAmount?: DecimalFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntFilter<"LoanRequest"> | number
    purpose?: StringFilter<"LoanRequest"> | string
    applicantId?: StringFilter<"LoanRequest"> | string
    applicantFirstName?: StringFilter<"LoanRequest"> | string
    applicantLastName?: StringFilter<"LoanRequest"> | string
    applicantEmail?: StringFilter<"LoanRequest"> | string
    applicantPhone?: StringNullableFilter<"LoanRequest"> | string | null
    applicantDateOfBirth?: DateTimeNullableFilter<"LoanRequest"> | Date | string | null
    applicantNationalId?: StringNullableFilter<"LoanRequest"> | string | null
    applicantEmploymentStatus?: StringNullableFilter<"LoanRequest"> | string | null
    applicantAnnualIncome?: DecimalNullableFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: IntNullableFilter<"LoanRequest"> | number | null
    applicantExistingDebt?: DecimalNullableFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolFilter<"LoanRequest"> | boolean
    applicantKycVerifiedAt?: DateTimeNullableFilter<"LoanRequest"> | Date | string | null
    applicantAddress?: JsonNullableFilter<"LoanRequest">
    applicantAddressEnc?: StringNullableFilter<"LoanRequest"> | string | null
    businessInfo?: JsonNullableFilter<"LoanRequest">
    collateral?: JsonNullableFilter<"LoanRequest">
    metadata?: JsonFilter<"LoanRequest">
    submittedAt?: DateTimeFilter<"LoanRequest"> | Date | string
    createdAt?: DateTimeFilter<"LoanRequest"> | Date | string
    updatedAt?: DateTimeFilter<"LoanRequest"> | Date | string
    idempotencyKey?: StringNullableFilter<"LoanRequest"> | string | null
    piiKeyVersion?: StringFilter<"LoanRequest"> | string
  }

  export type LoanRequestOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    loanType?: SortOrder
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    purpose?: SortOrder
    applicantId?: SortOrder
    applicantFirstName?: SortOrder
    applicantLastName?: SortOrder
    applicantEmail?: SortOrder
    applicantPhone?: SortOrderInput | SortOrder
    applicantDateOfBirth?: SortOrderInput | SortOrder
    applicantNationalId?: SortOrderInput | SortOrder
    applicantEmploymentStatus?: SortOrderInput | SortOrder
    applicantAnnualIncome?: SortOrderInput | SortOrder
    applicantCreditScore?: SortOrderInput | SortOrder
    applicantExistingDebt?: SortOrderInput | SortOrder
    applicantKycVerified?: SortOrder
    applicantKycVerifiedAt?: SortOrderInput | SortOrder
    applicantAddress?: SortOrderInput | SortOrder
    applicantAddressEnc?: SortOrderInput | SortOrder
    businessInfo?: SortOrderInput | SortOrder
    collateral?: SortOrderInput | SortOrder
    metadata?: SortOrder
    submittedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    idempotencyKey?: SortOrderInput | SortOrder
    piiKeyVersion?: SortOrder
  }

  export type LoanRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idempotencyKey?: string
    AND?: LoanRequestWhereInput | LoanRequestWhereInput[]
    OR?: LoanRequestWhereInput[]
    NOT?: LoanRequestWhereInput | LoanRequestWhereInput[]
    tenantId?: UuidFilter<"LoanRequest"> | string
    status?: StringFilter<"LoanRequest"> | string
    loanType?: StringFilter<"LoanRequest"> | string
    requestedAmount?: DecimalFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntFilter<"LoanRequest"> | number
    purpose?: StringFilter<"LoanRequest"> | string
    applicantId?: StringFilter<"LoanRequest"> | string
    applicantFirstName?: StringFilter<"LoanRequest"> | string
    applicantLastName?: StringFilter<"LoanRequest"> | string
    applicantEmail?: StringFilter<"LoanRequest"> | string
    applicantPhone?: StringNullableFilter<"LoanRequest"> | string | null
    applicantDateOfBirth?: DateTimeNullableFilter<"LoanRequest"> | Date | string | null
    applicantNationalId?: StringNullableFilter<"LoanRequest"> | string | null
    applicantEmploymentStatus?: StringNullableFilter<"LoanRequest"> | string | null
    applicantAnnualIncome?: DecimalNullableFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: IntNullableFilter<"LoanRequest"> | number | null
    applicantExistingDebt?: DecimalNullableFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolFilter<"LoanRequest"> | boolean
    applicantKycVerifiedAt?: DateTimeNullableFilter<"LoanRequest"> | Date | string | null
    applicantAddress?: JsonNullableFilter<"LoanRequest">
    applicantAddressEnc?: StringNullableFilter<"LoanRequest"> | string | null
    businessInfo?: JsonNullableFilter<"LoanRequest">
    collateral?: JsonNullableFilter<"LoanRequest">
    metadata?: JsonFilter<"LoanRequest">
    submittedAt?: DateTimeFilter<"LoanRequest"> | Date | string
    createdAt?: DateTimeFilter<"LoanRequest"> | Date | string
    updatedAt?: DateTimeFilter<"LoanRequest"> | Date | string
    piiKeyVersion?: StringFilter<"LoanRequest"> | string
  }, "id" | "idempotencyKey">

  export type LoanRequestOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    loanType?: SortOrder
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    purpose?: SortOrder
    applicantId?: SortOrder
    applicantFirstName?: SortOrder
    applicantLastName?: SortOrder
    applicantEmail?: SortOrder
    applicantPhone?: SortOrderInput | SortOrder
    applicantDateOfBirth?: SortOrderInput | SortOrder
    applicantNationalId?: SortOrderInput | SortOrder
    applicantEmploymentStatus?: SortOrderInput | SortOrder
    applicantAnnualIncome?: SortOrderInput | SortOrder
    applicantCreditScore?: SortOrderInput | SortOrder
    applicantExistingDebt?: SortOrderInput | SortOrder
    applicantKycVerified?: SortOrder
    applicantKycVerifiedAt?: SortOrderInput | SortOrder
    applicantAddress?: SortOrderInput | SortOrder
    applicantAddressEnc?: SortOrderInput | SortOrder
    businessInfo?: SortOrderInput | SortOrder
    collateral?: SortOrderInput | SortOrder
    metadata?: SortOrder
    submittedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    idempotencyKey?: SortOrderInput | SortOrder
    piiKeyVersion?: SortOrder
    _count?: LoanRequestCountOrderByAggregateInput
    _avg?: LoanRequestAvgOrderByAggregateInput
    _max?: LoanRequestMaxOrderByAggregateInput
    _min?: LoanRequestMinOrderByAggregateInput
    _sum?: LoanRequestSumOrderByAggregateInput
  }

  export type LoanRequestScalarWhereWithAggregatesInput = {
    AND?: LoanRequestScalarWhereWithAggregatesInput | LoanRequestScalarWhereWithAggregatesInput[]
    OR?: LoanRequestScalarWhereWithAggregatesInput[]
    NOT?: LoanRequestScalarWhereWithAggregatesInput | LoanRequestScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"LoanRequest"> | string
    tenantId?: UuidWithAggregatesFilter<"LoanRequest"> | string
    status?: StringWithAggregatesFilter<"LoanRequest"> | string
    loanType?: StringWithAggregatesFilter<"LoanRequest"> | string
    requestedAmount?: DecimalWithAggregatesFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntWithAggregatesFilter<"LoanRequest"> | number
    purpose?: StringWithAggregatesFilter<"LoanRequest"> | string
    applicantId?: StringWithAggregatesFilter<"LoanRequest"> | string
    applicantFirstName?: StringWithAggregatesFilter<"LoanRequest"> | string
    applicantLastName?: StringWithAggregatesFilter<"LoanRequest"> | string
    applicantEmail?: StringWithAggregatesFilter<"LoanRequest"> | string
    applicantPhone?: StringNullableWithAggregatesFilter<"LoanRequest"> | string | null
    applicantDateOfBirth?: DateTimeNullableWithAggregatesFilter<"LoanRequest"> | Date | string | null
    applicantNationalId?: StringNullableWithAggregatesFilter<"LoanRequest"> | string | null
    applicantEmploymentStatus?: StringNullableWithAggregatesFilter<"LoanRequest"> | string | null
    applicantAnnualIncome?: DecimalNullableWithAggregatesFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: IntNullableWithAggregatesFilter<"LoanRequest"> | number | null
    applicantExistingDebt?: DecimalNullableWithAggregatesFilter<"LoanRequest"> | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolWithAggregatesFilter<"LoanRequest"> | boolean
    applicantKycVerifiedAt?: DateTimeNullableWithAggregatesFilter<"LoanRequest"> | Date | string | null
    applicantAddress?: JsonNullableWithAggregatesFilter<"LoanRequest">
    applicantAddressEnc?: StringNullableWithAggregatesFilter<"LoanRequest"> | string | null
    businessInfo?: JsonNullableWithAggregatesFilter<"LoanRequest">
    collateral?: JsonNullableWithAggregatesFilter<"LoanRequest">
    metadata?: JsonWithAggregatesFilter<"LoanRequest">
    submittedAt?: DateTimeWithAggregatesFilter<"LoanRequest"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"LoanRequest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LoanRequest"> | Date | string
    idempotencyKey?: StringNullableWithAggregatesFilter<"LoanRequest"> | string | null
    piiKeyVersion?: StringWithAggregatesFilter<"LoanRequest"> | string
  }

  export type WorkflowRunWhereInput = {
    AND?: WorkflowRunWhereInput | WorkflowRunWhereInput[]
    OR?: WorkflowRunWhereInput[]
    NOT?: WorkflowRunWhereInput | WorkflowRunWhereInput[]
    id?: UuidFilter<"WorkflowRun"> | string
    tenantId?: UuidFilter<"WorkflowRun"> | string
    loanRequestId?: UuidFilter<"WorkflowRun"> | string
    temporalWorkflowId?: StringFilter<"WorkflowRun"> | string
    temporalRunId?: StringFilter<"WorkflowRun"> | string
    status?: StringFilter<"WorkflowRun"> | string
    currentStep?: StringNullableFilter<"WorkflowRun"> | string | null
    loanStatus?: StringNullableFilter<"WorkflowRun"> | string | null
    policyVersion?: StringNullableFilter<"WorkflowRun"> | string | null
    aiModelVersion?: StringNullableFilter<"WorkflowRun"> | string | null
    fraudModelVersion?: StringNullableFilter<"WorkflowRun"> | string | null
    traceId?: StringNullableFilter<"WorkflowRun"> | string | null
    correlationId?: StringNullableFilter<"WorkflowRun"> | string | null
    steps?: JsonFilter<"WorkflowRun">
    errorDetails?: JsonNullableFilter<"WorkflowRun">
    startedAt?: DateTimeFilter<"WorkflowRun"> | Date | string
    completedAt?: DateTimeNullableFilter<"WorkflowRun"> | Date | string | null
    createdAt?: DateTimeFilter<"WorkflowRun"> | Date | string
    updatedAt?: DateTimeFilter<"WorkflowRun"> | Date | string
  }

  export type WorkflowRunOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    temporalWorkflowId?: SortOrder
    temporalRunId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrderInput | SortOrder
    loanStatus?: SortOrderInput | SortOrder
    policyVersion?: SortOrderInput | SortOrder
    aiModelVersion?: SortOrderInput | SortOrder
    fraudModelVersion?: SortOrderInput | SortOrder
    traceId?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    steps?: SortOrder
    errorDetails?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WorkflowRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    temporalWorkflowId?: string
    AND?: WorkflowRunWhereInput | WorkflowRunWhereInput[]
    OR?: WorkflowRunWhereInput[]
    NOT?: WorkflowRunWhereInput | WorkflowRunWhereInput[]
    tenantId?: UuidFilter<"WorkflowRun"> | string
    loanRequestId?: UuidFilter<"WorkflowRun"> | string
    temporalRunId?: StringFilter<"WorkflowRun"> | string
    status?: StringFilter<"WorkflowRun"> | string
    currentStep?: StringNullableFilter<"WorkflowRun"> | string | null
    loanStatus?: StringNullableFilter<"WorkflowRun"> | string | null
    policyVersion?: StringNullableFilter<"WorkflowRun"> | string | null
    aiModelVersion?: StringNullableFilter<"WorkflowRun"> | string | null
    fraudModelVersion?: StringNullableFilter<"WorkflowRun"> | string | null
    traceId?: StringNullableFilter<"WorkflowRun"> | string | null
    correlationId?: StringNullableFilter<"WorkflowRun"> | string | null
    steps?: JsonFilter<"WorkflowRun">
    errorDetails?: JsonNullableFilter<"WorkflowRun">
    startedAt?: DateTimeFilter<"WorkflowRun"> | Date | string
    completedAt?: DateTimeNullableFilter<"WorkflowRun"> | Date | string | null
    createdAt?: DateTimeFilter<"WorkflowRun"> | Date | string
    updatedAt?: DateTimeFilter<"WorkflowRun"> | Date | string
  }, "id" | "temporalWorkflowId">

  export type WorkflowRunOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    temporalWorkflowId?: SortOrder
    temporalRunId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrderInput | SortOrder
    loanStatus?: SortOrderInput | SortOrder
    policyVersion?: SortOrderInput | SortOrder
    aiModelVersion?: SortOrderInput | SortOrder
    fraudModelVersion?: SortOrderInput | SortOrder
    traceId?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    steps?: SortOrder
    errorDetails?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WorkflowRunCountOrderByAggregateInput
    _max?: WorkflowRunMaxOrderByAggregateInput
    _min?: WorkflowRunMinOrderByAggregateInput
  }

  export type WorkflowRunScalarWhereWithAggregatesInput = {
    AND?: WorkflowRunScalarWhereWithAggregatesInput | WorkflowRunScalarWhereWithAggregatesInput[]
    OR?: WorkflowRunScalarWhereWithAggregatesInput[]
    NOT?: WorkflowRunScalarWhereWithAggregatesInput | WorkflowRunScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"WorkflowRun"> | string
    tenantId?: UuidWithAggregatesFilter<"WorkflowRun"> | string
    loanRequestId?: UuidWithAggregatesFilter<"WorkflowRun"> | string
    temporalWorkflowId?: StringWithAggregatesFilter<"WorkflowRun"> | string
    temporalRunId?: StringWithAggregatesFilter<"WorkflowRun"> | string
    status?: StringWithAggregatesFilter<"WorkflowRun"> | string
    currentStep?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    loanStatus?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    policyVersion?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    aiModelVersion?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    fraudModelVersion?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    traceId?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    correlationId?: StringNullableWithAggregatesFilter<"WorkflowRun"> | string | null
    steps?: JsonWithAggregatesFilter<"WorkflowRun">
    errorDetails?: JsonNullableWithAggregatesFilter<"WorkflowRun">
    startedAt?: DateTimeWithAggregatesFilter<"WorkflowRun"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"WorkflowRun"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"WorkflowRun"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkflowRun"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: UuidFilter<"AuditLog"> | string
    tenantId?: UuidFilter<"AuditLog"> | string
    loanRequestId?: UuidNullableFilter<"AuditLog"> | string | null
    workflowRunId?: UuidNullableFilter<"AuditLog"> | string | null
    eventType?: StringFilter<"AuditLog"> | string
    actorId?: UuidNullableFilter<"AuditLog"> | string | null
    actorType?: StringFilter<"AuditLog"> | string
    serviceName?: StringFilter<"AuditLog"> | string
    payload?: JsonFilter<"AuditLog">
    traceId?: StringNullableFilter<"AuditLog"> | string | null
    spanId?: StringNullableFilter<"AuditLog"> | string | null
    correlationId?: StringNullableFilter<"AuditLog"> | string | null
    version?: StringFilter<"AuditLog"> | string
    environment?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    hash?: StringFilter<"AuditLog"> | string
    previousHash?: StringNullableFilter<"AuditLog"> | string | null
    signature?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrderInput | SortOrder
    workflowRunId?: SortOrderInput | SortOrder
    eventType?: SortOrder
    actorId?: SortOrderInput | SortOrder
    actorType?: SortOrder
    serviceName?: SortOrder
    payload?: SortOrder
    traceId?: SortOrderInput | SortOrder
    spanId?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    version?: SortOrder
    environment?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    hash?: SortOrder
    previousHash?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id_createdAt?: AuditLogIdCreatedAtCompoundUniqueInput
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: UuidFilter<"AuditLog"> | string
    tenantId?: UuidFilter<"AuditLog"> | string
    loanRequestId?: UuidNullableFilter<"AuditLog"> | string | null
    workflowRunId?: UuidNullableFilter<"AuditLog"> | string | null
    eventType?: StringFilter<"AuditLog"> | string
    actorId?: UuidNullableFilter<"AuditLog"> | string | null
    actorType?: StringFilter<"AuditLog"> | string
    serviceName?: StringFilter<"AuditLog"> | string
    payload?: JsonFilter<"AuditLog">
    traceId?: StringNullableFilter<"AuditLog"> | string | null
    spanId?: StringNullableFilter<"AuditLog"> | string | null
    correlationId?: StringNullableFilter<"AuditLog"> | string | null
    version?: StringFilter<"AuditLog"> | string
    environment?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    hash?: StringFilter<"AuditLog"> | string
    previousHash?: StringNullableFilter<"AuditLog"> | string | null
    signature?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }, "id_createdAt">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrderInput | SortOrder
    workflowRunId?: SortOrderInput | SortOrder
    eventType?: SortOrder
    actorId?: SortOrderInput | SortOrder
    actorType?: SortOrder
    serviceName?: SortOrder
    payload?: SortOrder
    traceId?: SortOrderInput | SortOrder
    spanId?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    version?: SortOrder
    environment?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    hash?: SortOrder
    previousHash?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AuditLog"> | string
    tenantId?: UuidWithAggregatesFilter<"AuditLog"> | string
    loanRequestId?: UuidNullableWithAggregatesFilter<"AuditLog"> | string | null
    workflowRunId?: UuidNullableWithAggregatesFilter<"AuditLog"> | string | null
    eventType?: StringWithAggregatesFilter<"AuditLog"> | string
    actorId?: UuidNullableWithAggregatesFilter<"AuditLog"> | string | null
    actorType?: StringWithAggregatesFilter<"AuditLog"> | string
    serviceName?: StringWithAggregatesFilter<"AuditLog"> | string
    payload?: JsonWithAggregatesFilter<"AuditLog">
    traceId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    spanId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    correlationId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    version?: StringWithAggregatesFilter<"AuditLog"> | string
    environment?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    hash?: StringWithAggregatesFilter<"AuditLog"> | string
    previousHash?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    signature?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type DocumentEmbeddingWhereInput = {
    AND?: DocumentEmbeddingWhereInput | DocumentEmbeddingWhereInput[]
    OR?: DocumentEmbeddingWhereInput[]
    NOT?: DocumentEmbeddingWhereInput | DocumentEmbeddingWhereInput[]
    id?: UuidFilter<"DocumentEmbedding"> | string
    tenantId?: UuidFilter<"DocumentEmbedding"> | string
    documentType?: StringFilter<"DocumentEmbedding"> | string
    source?: StringNullableFilter<"DocumentEmbedding"> | string | null
    title?: StringNullableFilter<"DocumentEmbedding"> | string | null
    content?: StringFilter<"DocumentEmbedding"> | string
    chunkIndex?: IntFilter<"DocumentEmbedding"> | number
    metadata?: JsonNullableFilter<"DocumentEmbedding">
    createdAt?: DateTimeFilter<"DocumentEmbedding"> | Date | string
  }

  export type DocumentEmbeddingOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    documentType?: SortOrder
    source?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type DocumentEmbeddingWhereUniqueInput = Prisma.AtLeast<{
    id_tenantId?: DocumentEmbeddingIdTenantIdCompoundUniqueInput
    AND?: DocumentEmbeddingWhereInput | DocumentEmbeddingWhereInput[]
    OR?: DocumentEmbeddingWhereInput[]
    NOT?: DocumentEmbeddingWhereInput | DocumentEmbeddingWhereInput[]
    id?: UuidFilter<"DocumentEmbedding"> | string
    tenantId?: UuidFilter<"DocumentEmbedding"> | string
    documentType?: StringFilter<"DocumentEmbedding"> | string
    source?: StringNullableFilter<"DocumentEmbedding"> | string | null
    title?: StringNullableFilter<"DocumentEmbedding"> | string | null
    content?: StringFilter<"DocumentEmbedding"> | string
    chunkIndex?: IntFilter<"DocumentEmbedding"> | number
    metadata?: JsonNullableFilter<"DocumentEmbedding">
    createdAt?: DateTimeFilter<"DocumentEmbedding"> | Date | string
  }, "id_tenantId">

  export type DocumentEmbeddingOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    documentType?: SortOrder
    source?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: DocumentEmbeddingCountOrderByAggregateInput
    _avg?: DocumentEmbeddingAvgOrderByAggregateInput
    _max?: DocumentEmbeddingMaxOrderByAggregateInput
    _min?: DocumentEmbeddingMinOrderByAggregateInput
    _sum?: DocumentEmbeddingSumOrderByAggregateInput
  }

  export type DocumentEmbeddingScalarWhereWithAggregatesInput = {
    AND?: DocumentEmbeddingScalarWhereWithAggregatesInput | DocumentEmbeddingScalarWhereWithAggregatesInput[]
    OR?: DocumentEmbeddingScalarWhereWithAggregatesInput[]
    NOT?: DocumentEmbeddingScalarWhereWithAggregatesInput | DocumentEmbeddingScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"DocumentEmbedding"> | string
    tenantId?: UuidWithAggregatesFilter<"DocumentEmbedding"> | string
    documentType?: StringWithAggregatesFilter<"DocumentEmbedding"> | string
    source?: StringNullableWithAggregatesFilter<"DocumentEmbedding"> | string | null
    title?: StringNullableWithAggregatesFilter<"DocumentEmbedding"> | string | null
    content?: StringWithAggregatesFilter<"DocumentEmbedding"> | string
    chunkIndex?: IntWithAggregatesFilter<"DocumentEmbedding"> | number
    metadata?: JsonNullableWithAggregatesFilter<"DocumentEmbedding">
    createdAt?: DateTimeWithAggregatesFilter<"DocumentEmbedding"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    isActive?: boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    isActive?: boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateManyInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    isActive?: boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    tenantId: string
    email: string
    firstName?: string | null
    lastName?: string | null
    role?: string
    passwordHash?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    firstName?: string | null
    lastName?: string | null
    role?: string
    passwordHash?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    firstName?: string | null
    lastName?: string | null
    role?: string
    passwordHash?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoanRequestCreateInput = {
    id?: string
    tenantId: string
    status?: string
    loanType: string
    requestedAmount: Decimal | DecimalJsLike | number | string
    requestedTermMonths: number
    purpose: string
    applicantId: string
    applicantFirstName: string
    applicantLastName: string
    applicantEmail: string
    applicantPhone?: string | null
    applicantDateOfBirth?: Date | string | null
    applicantNationalId?: string | null
    applicantEmploymentStatus?: string | null
    applicantAnnualIncome?: Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: number | null
    applicantExistingDebt?: Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    idempotencyKey?: string | null
    piiKeyVersion?: string
  }

  export type LoanRequestUncheckedCreateInput = {
    id?: string
    tenantId: string
    status?: string
    loanType: string
    requestedAmount: Decimal | DecimalJsLike | number | string
    requestedTermMonths: number
    purpose: string
    applicantId: string
    applicantFirstName: string
    applicantLastName: string
    applicantEmail: string
    applicantPhone?: string | null
    applicantDateOfBirth?: Date | string | null
    applicantNationalId?: string | null
    applicantEmploymentStatus?: string | null
    applicantAnnualIncome?: Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: number | null
    applicantExistingDebt?: Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    idempotencyKey?: string | null
    piiKeyVersion?: string
  }

  export type LoanRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    loanType?: StringFieldUpdateOperationsInput | string
    requestedAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntFieldUpdateOperationsInput | number
    purpose?: StringFieldUpdateOperationsInput | string
    applicantId?: StringFieldUpdateOperationsInput | string
    applicantFirstName?: StringFieldUpdateOperationsInput | string
    applicantLastName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    applicantPhone?: NullableStringFieldUpdateOperationsInput | string | null
    applicantDateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantNationalId?: NullableStringFieldUpdateOperationsInput | string | null
    applicantEmploymentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    applicantAnnualIncome?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: NullableIntFieldUpdateOperationsInput | number | null
    applicantExistingDebt?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolFieldUpdateOperationsInput | boolean
    applicantKycVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: NullableStringFieldUpdateOperationsInput | string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    piiKeyVersion?: StringFieldUpdateOperationsInput | string
  }

  export type LoanRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    loanType?: StringFieldUpdateOperationsInput | string
    requestedAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntFieldUpdateOperationsInput | number
    purpose?: StringFieldUpdateOperationsInput | string
    applicantId?: StringFieldUpdateOperationsInput | string
    applicantFirstName?: StringFieldUpdateOperationsInput | string
    applicantLastName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    applicantPhone?: NullableStringFieldUpdateOperationsInput | string | null
    applicantDateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantNationalId?: NullableStringFieldUpdateOperationsInput | string | null
    applicantEmploymentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    applicantAnnualIncome?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: NullableIntFieldUpdateOperationsInput | number | null
    applicantExistingDebt?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolFieldUpdateOperationsInput | boolean
    applicantKycVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: NullableStringFieldUpdateOperationsInput | string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    piiKeyVersion?: StringFieldUpdateOperationsInput | string
  }

  export type LoanRequestCreateManyInput = {
    id?: string
    tenantId: string
    status?: string
    loanType: string
    requestedAmount: Decimal | DecimalJsLike | number | string
    requestedTermMonths: number
    purpose: string
    applicantId: string
    applicantFirstName: string
    applicantLastName: string
    applicantEmail: string
    applicantPhone?: string | null
    applicantDateOfBirth?: Date | string | null
    applicantNationalId?: string | null
    applicantEmploymentStatus?: string | null
    applicantAnnualIncome?: Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: number | null
    applicantExistingDebt?: Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: boolean
    applicantKycVerifiedAt?: Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    idempotencyKey?: string | null
    piiKeyVersion?: string
  }

  export type LoanRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    loanType?: StringFieldUpdateOperationsInput | string
    requestedAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntFieldUpdateOperationsInput | number
    purpose?: StringFieldUpdateOperationsInput | string
    applicantId?: StringFieldUpdateOperationsInput | string
    applicantFirstName?: StringFieldUpdateOperationsInput | string
    applicantLastName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    applicantPhone?: NullableStringFieldUpdateOperationsInput | string | null
    applicantDateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantNationalId?: NullableStringFieldUpdateOperationsInput | string | null
    applicantEmploymentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    applicantAnnualIncome?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: NullableIntFieldUpdateOperationsInput | number | null
    applicantExistingDebt?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolFieldUpdateOperationsInput | boolean
    applicantKycVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: NullableStringFieldUpdateOperationsInput | string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    piiKeyVersion?: StringFieldUpdateOperationsInput | string
  }

  export type LoanRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    loanType?: StringFieldUpdateOperationsInput | string
    requestedAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    requestedTermMonths?: IntFieldUpdateOperationsInput | number
    purpose?: StringFieldUpdateOperationsInput | string
    applicantId?: StringFieldUpdateOperationsInput | string
    applicantFirstName?: StringFieldUpdateOperationsInput | string
    applicantLastName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    applicantPhone?: NullableStringFieldUpdateOperationsInput | string | null
    applicantDateOfBirth?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantNationalId?: NullableStringFieldUpdateOperationsInput | string | null
    applicantEmploymentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    applicantAnnualIncome?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantCreditScore?: NullableIntFieldUpdateOperationsInput | number | null
    applicantExistingDebt?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    applicantKycVerified?: BoolFieldUpdateOperationsInput | boolean
    applicantKycVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    applicantAddress?: NullableJsonNullValueInput | InputJsonValue
    applicantAddressEnc?: NullableStringFieldUpdateOperationsInput | string | null
    businessInfo?: NullableJsonNullValueInput | InputJsonValue
    collateral?: NullableJsonNullValueInput | InputJsonValue
    metadata?: JsonNullValueInput | InputJsonValue
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    idempotencyKey?: NullableStringFieldUpdateOperationsInput | string | null
    piiKeyVersion?: StringFieldUpdateOperationsInput | string
  }

  export type WorkflowRunCreateInput = {
    id?: string
    tenantId: string
    loanRequestId: string
    temporalWorkflowId: string
    temporalRunId: string
    status?: string
    currentStep?: string | null
    loanStatus?: string | null
    policyVersion?: string | null
    aiModelVersion?: string | null
    fraudModelVersion?: string | null
    traceId?: string | null
    correlationId?: string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkflowRunUncheckedCreateInput = {
    id?: string
    tenantId: string
    loanRequestId: string
    temporalWorkflowId: string
    temporalRunId: string
    status?: string
    currentStep?: string | null
    loanStatus?: string | null
    policyVersion?: string | null
    aiModelVersion?: string | null
    fraudModelVersion?: string | null
    traceId?: string | null
    correlationId?: string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkflowRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: StringFieldUpdateOperationsInput | string
    temporalWorkflowId?: StringFieldUpdateOperationsInput | string
    temporalRunId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    loanStatus?: NullableStringFieldUpdateOperationsInput | string | null
    policyVersion?: NullableStringFieldUpdateOperationsInput | string | null
    aiModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    fraudModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkflowRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: StringFieldUpdateOperationsInput | string
    temporalWorkflowId?: StringFieldUpdateOperationsInput | string
    temporalRunId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    loanStatus?: NullableStringFieldUpdateOperationsInput | string | null
    policyVersion?: NullableStringFieldUpdateOperationsInput | string | null
    aiModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    fraudModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkflowRunCreateManyInput = {
    id?: string
    tenantId: string
    loanRequestId: string
    temporalWorkflowId: string
    temporalRunId: string
    status?: string
    currentStep?: string | null
    loanStatus?: string | null
    policyVersion?: string | null
    aiModelVersion?: string | null
    fraudModelVersion?: string | null
    traceId?: string | null
    correlationId?: string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WorkflowRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: StringFieldUpdateOperationsInput | string
    temporalWorkflowId?: StringFieldUpdateOperationsInput | string
    temporalRunId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    loanStatus?: NullableStringFieldUpdateOperationsInput | string | null
    policyVersion?: NullableStringFieldUpdateOperationsInput | string | null
    aiModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    fraudModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkflowRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: StringFieldUpdateOperationsInput | string
    temporalWorkflowId?: StringFieldUpdateOperationsInput | string
    temporalRunId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: NullableStringFieldUpdateOperationsInput | string | null
    loanStatus?: NullableStringFieldUpdateOperationsInput | string | null
    policyVersion?: NullableStringFieldUpdateOperationsInput | string | null
    aiModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    fraudModelVersion?: NullableStringFieldUpdateOperationsInput | string | null
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    steps?: JsonNullValueInput | InputJsonValue
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    tenantId: string
    loanRequestId?: string | null
    workflowRunId?: string | null
    eventType: string
    actorId?: string | null
    actorType: string
    serviceName: string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: string | null
    spanId?: string | null
    correlationId?: string | null
    version?: string
    environment?: string | null
    userAgent?: string | null
    hash: string
    previousHash?: string | null
    signature?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    tenantId: string
    loanRequestId?: string | null
    workflowRunId?: string | null
    eventType: string
    actorId?: string | null
    actorType: string
    serviceName: string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: string | null
    spanId?: string | null
    correlationId?: string | null
    version?: string
    environment?: string | null
    userAgent?: string | null
    hash: string
    previousHash?: string | null
    signature?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: NullableStringFieldUpdateOperationsInput | string | null
    workflowRunId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    spanId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    environment?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    hash?: StringFieldUpdateOperationsInput | string
    previousHash?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: NullableStringFieldUpdateOperationsInput | string | null
    workflowRunId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    spanId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    environment?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    hash?: StringFieldUpdateOperationsInput | string
    previousHash?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    tenantId: string
    loanRequestId?: string | null
    workflowRunId?: string | null
    eventType: string
    actorId?: string | null
    actorType: string
    serviceName: string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: string | null
    spanId?: string | null
    correlationId?: string | null
    version?: string
    environment?: string | null
    userAgent?: string | null
    hash: string
    previousHash?: string | null
    signature?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: NullableStringFieldUpdateOperationsInput | string | null
    workflowRunId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    spanId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    environment?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    hash?: StringFieldUpdateOperationsInput | string
    previousHash?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    loanRequestId?: NullableStringFieldUpdateOperationsInput | string | null
    workflowRunId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    traceId?: NullableStringFieldUpdateOperationsInput | string | null
    spanId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    version?: StringFieldUpdateOperationsInput | string
    environment?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    hash?: StringFieldUpdateOperationsInput | string
    previousHash?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentEmbeddingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    documentType?: StringFieldUpdateOperationsInput | string
    source?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentEmbeddingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    documentType?: StringFieldUpdateOperationsInput | string
    source?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentEmbeddingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    documentType?: StringFieldUpdateOperationsInput | string
    source?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentEmbeddingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    documentType?: StringFieldUpdateOperationsInput | string
    source?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
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

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    isActive?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserTenantIdEmailCompoundUniqueInput = {
    tenantId: string
    email: string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    passwordHash?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    passwordHash?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    passwordHash?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type LoanRequestCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    loanType?: SortOrder
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    purpose?: SortOrder
    applicantId?: SortOrder
    applicantFirstName?: SortOrder
    applicantLastName?: SortOrder
    applicantEmail?: SortOrder
    applicantPhone?: SortOrder
    applicantDateOfBirth?: SortOrder
    applicantNationalId?: SortOrder
    applicantEmploymentStatus?: SortOrder
    applicantAnnualIncome?: SortOrder
    applicantCreditScore?: SortOrder
    applicantExistingDebt?: SortOrder
    applicantKycVerified?: SortOrder
    applicantKycVerifiedAt?: SortOrder
    applicantAddress?: SortOrder
    applicantAddressEnc?: SortOrder
    businessInfo?: SortOrder
    collateral?: SortOrder
    metadata?: SortOrder
    submittedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    idempotencyKey?: SortOrder
    piiKeyVersion?: SortOrder
  }

  export type LoanRequestAvgOrderByAggregateInput = {
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    applicantAnnualIncome?: SortOrder
    applicantCreditScore?: SortOrder
    applicantExistingDebt?: SortOrder
  }

  export type LoanRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    loanType?: SortOrder
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    purpose?: SortOrder
    applicantId?: SortOrder
    applicantFirstName?: SortOrder
    applicantLastName?: SortOrder
    applicantEmail?: SortOrder
    applicantPhone?: SortOrder
    applicantDateOfBirth?: SortOrder
    applicantNationalId?: SortOrder
    applicantEmploymentStatus?: SortOrder
    applicantAnnualIncome?: SortOrder
    applicantCreditScore?: SortOrder
    applicantExistingDebt?: SortOrder
    applicantKycVerified?: SortOrder
    applicantKycVerifiedAt?: SortOrder
    applicantAddressEnc?: SortOrder
    submittedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    idempotencyKey?: SortOrder
    piiKeyVersion?: SortOrder
  }

  export type LoanRequestMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    loanType?: SortOrder
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    purpose?: SortOrder
    applicantId?: SortOrder
    applicantFirstName?: SortOrder
    applicantLastName?: SortOrder
    applicantEmail?: SortOrder
    applicantPhone?: SortOrder
    applicantDateOfBirth?: SortOrder
    applicantNationalId?: SortOrder
    applicantEmploymentStatus?: SortOrder
    applicantAnnualIncome?: SortOrder
    applicantCreditScore?: SortOrder
    applicantExistingDebt?: SortOrder
    applicantKycVerified?: SortOrder
    applicantKycVerifiedAt?: SortOrder
    applicantAddressEnc?: SortOrder
    submittedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    idempotencyKey?: SortOrder
    piiKeyVersion?: SortOrder
  }

  export type LoanRequestSumOrderByAggregateInput = {
    requestedAmount?: SortOrder
    requestedTermMonths?: SortOrder
    applicantAnnualIncome?: SortOrder
    applicantCreditScore?: SortOrder
    applicantExistingDebt?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type WorkflowRunCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    temporalWorkflowId?: SortOrder
    temporalRunId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    loanStatus?: SortOrder
    policyVersion?: SortOrder
    aiModelVersion?: SortOrder
    fraudModelVersion?: SortOrder
    traceId?: SortOrder
    correlationId?: SortOrder
    steps?: SortOrder
    errorDetails?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WorkflowRunMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    temporalWorkflowId?: SortOrder
    temporalRunId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    loanStatus?: SortOrder
    policyVersion?: SortOrder
    aiModelVersion?: SortOrder
    fraudModelVersion?: SortOrder
    traceId?: SortOrder
    correlationId?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WorkflowRunMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    temporalWorkflowId?: SortOrder
    temporalRunId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    loanStatus?: SortOrder
    policyVersion?: SortOrder
    aiModelVersion?: SortOrder
    fraudModelVersion?: SortOrder
    traceId?: SortOrder
    correlationId?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type AuditLogIdCreatedAtCompoundUniqueInput = {
    id: string
    createdAt: Date | string
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    workflowRunId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrder
    actorType?: SortOrder
    serviceName?: SortOrder
    payload?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    correlationId?: SortOrder
    version?: SortOrder
    environment?: SortOrder
    userAgent?: SortOrder
    hash?: SortOrder
    previousHash?: SortOrder
    signature?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    workflowRunId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrder
    actorType?: SortOrder
    serviceName?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    correlationId?: SortOrder
    version?: SortOrder
    environment?: SortOrder
    userAgent?: SortOrder
    hash?: SortOrder
    previousHash?: SortOrder
    signature?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    loanRequestId?: SortOrder
    workflowRunId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrder
    actorType?: SortOrder
    serviceName?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    correlationId?: SortOrder
    version?: SortOrder
    environment?: SortOrder
    userAgent?: SortOrder
    hash?: SortOrder
    previousHash?: SortOrder
    signature?: SortOrder
    createdAt?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DocumentEmbeddingIdTenantIdCompoundUniqueInput = {
    id: string
    tenantId: string
  }

  export type DocumentEmbeddingCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    documentType?: SortOrder
    source?: SortOrder
    title?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type DocumentEmbeddingAvgOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type DocumentEmbeddingMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    documentType?: SortOrder
    source?: SortOrder
    title?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
  }

  export type DocumentEmbeddingMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    documentType?: SortOrder
    source?: SortOrder
    title?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    createdAt?: SortOrder
  }

  export type DocumentEmbeddingSumOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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