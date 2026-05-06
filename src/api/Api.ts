export interface SerializerConstructionJSON {
  construction_title?: string;
  description?: string;
  id?: number;
  image_url?: string;
  is_delete?: boolean;
  use_life?: string;
  video_url?: string;
}

export interface SerializerDendroConstructionUpdateJSON {
  cutting_date?: string;
  date_correction?: string;
  samples_count?: number;
}

export interface SerializerDendroConstructionViewJSON {
  construction_id?: number;
  construction_title?: string;
  cutting_date?: string;
  date_correction?: string;
  id?: number;
  image_url?: string;
  samples_count?: number;
  use_life?: string;
}

export interface SerializerDendrochronologyDetailJSON {
  build_date?: number;
  constructions?: SerializerDendroConstructionViewJSON[];
  creator_login?: string;
  date_completed?: string;
  date_create?: string;
  date_formed?: string;
  id?: number;
  moderator_login?: string;
  status?: string;
  total_samples?: number;
}

export interface SerializerDendrochronologyListJSON {
  build_date?: number;
  creator_login?: string;
  date_completed?: string;
  date_create?: string;
  date_formed?: string;
  dated_constructions_count?: number;
  id?: number;
  moderator_login?: string;
  status?: string;
  total_samples?: number;
}

export interface SerializerDendrochronologyUpdateJSON {
  build_date?: number;
}

export interface SerializerFinishJSON {
  status?: string;
}

export interface SerializerUserJSON {
  id?: number;
  is_moderator?: boolean;
  login?: string;
  password?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "//localhost:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Dendrochronology API
 * @version 1.0
 * @baseUrl //localhost:8080/api
 * @contact
 *
 * REST API: каталог конструкций, заявки на дендрохронологический анализ. Без авторизации доступны только GET каталога; с JWT — методы пользователя; модератор — создание конструкций и завершение заявок.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  constructions = {
    /**
     * No description
     *
     * @tags constructions
     * @name ConstructionsList
     * @summary Список конструкций
     * @request GET:/constructions
     */
    constructionsList: (
      query?: {
        /** Поиск по названию */
        query?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerConstructionJSON[], Record<string, string>>({
        path: `/constructions`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description multipart/form-data; только для is_moderator.
     *
     * @tags constructions
     * @name ConstructionsCreate
     * @summary Создать конструкцию
     * @request POST:/constructions
     * @secure
     */
    constructionsCreate: (
      data: {
        /** Название */
        construction_title: string;
        /** Use-life */
        use_life: string;
        /** Описание */
        description: string;
        /**
         * Изображение
         * @format binary
         */
        image?: File;
        /**
         * Видео
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerConstructionJSON, Record<string, string>>({
        path: `/constructions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags constructions
     * @name ConstructionsDetail
     * @summary Конструкция по id
     * @request GET:/constructions/{id}
     */
    constructionsDetail: (id: number, params: RequestParams = {}) =>
      this.request<SerializerConstructionJSON, Record<string, string>>({
        path: `/constructions/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет конструкцию в черновик заявки; при первом добавлении создаётся заявка (201 + Location).
     *
     * @tags dendrochronologies
     * @name AddToDendrochronologyCreate
     * @summary Добавить в корзину
     * @request POST:/constructions/{id}/add-to-dendrochronology
     * @secure
     */
    addToDendrochronologyCreate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerDendrochronologyListJSON, Record<string, string>>({
        path: `/constructions/${id}/add-to-dendrochronology`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  dendrochronologies = {
    /**
     * @description Без черновика и удалённых; фильтры по дате формирования и статусу. Пользователь видит свои; модератор — все.
     *
     * @tags dendrochronologies
     * @name DendrochronologiesList
     * @summary Список заявок на дендроанализ
     * @request GET:/dendrochronologies
     * @secure
     */
    dendrochronologiesList: (
      query?: {
        /** Начало диапазона даты формирования, YYYY-MM-DD */
        from_date?: string;
        /** Конец диапазона, YYYY-MM-DD */
        to_date?: string;
        /** Фильтр по статусу заявки */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        SerializerDendrochronologyListJSON[],
        Record<string, string>
      >({
        path: `/dendrochronologies`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Если черновика нет — { "status": "no_draft", "constructions_count": 0 }.
     *
     * @tags dendrochronologies
     * @name CartList
     * @summary Корзина (черновик)
     * @request GET:/dendrochronologies/cart
     * @secure
     */
    cartList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/dendrochronologies/cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Состав конструкций и логины; доступ: создатель или модератор.
     *
     * @tags dendrochronologies
     * @name DendrochronologiesDetail
     * @summary Заявка по id
     * @request GET:/dendrochronologies/{id}
     * @secure
     */
    dendrochronologiesDetail: (id: number, params: RequestParams = {}) =>
      this.request<
        SerializerDendrochronologyDetailJSON,
        Record<string, string>
      >({
        path: `/dendrochronologies/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags dendrochronologies
     * @name DendrochronologiesUpdate
     * @summary Обновить заявку
     * @request PUT:/dendrochronologies/{id}
     * @secure
     */
    dendrochronologiesUpdate: (
      id: number,
      body: SerializerDendrochronologyUpdateJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDendrochronologyListJSON, Record<string, string>>({
        path: `/dendrochronologies/${id}`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags dendrochronologies
     * @name DendrochronologiesDelete
     * @summary Удалить заявку
     * @request DELETE:/dendrochronologies/{id}
     * @secure
     */
    dendrochronologiesDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/dendrochronologies/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Установка итогового статуса; только для модератора.
     *
     * @tags dendrochronologies
     * @name FinishUpdate
     * @summary Завершить заявку
     * @request PUT:/dendrochronologies/{id}/finish
     * @secure
     */
    finishUpdate: (
      id: number,
      body: SerializerFinishJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDendrochronologyListJSON, Record<string, string>>({
        path: `/dendrochronologies/${id}/finish`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags dendrochronologies
     * @name FormUpdate
     * @summary Оформить заявку
     * @request PUT:/dendrochronologies/{id}/form
     * @secure
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerDendrochronologyListJSON, Record<string, string>>({
        path: `/dendrochronologies/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  dendrochronologyConstructions = {
    /**
     * @description Образцы, даты резки и коррекции для пары конструкция–заявка.
     *
     * @tags dendrochronologies
     * @name DendrochronologyConstructionsUpdate
     * @summary Изменить строку заявки
     * @request PUT:/dendrochronology-constructions/{construction_id}/{dendrochronology_id}
     * @secure
     */
    dendrochronologyConstructionsUpdate: (
      constructionId: number,
      dendrochronologyId: number,
      body: SerializerDendroConstructionUpdateJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        SerializerDendroConstructionUpdateJSON,
        Record<string, string>
      >({
        path: `/dendrochronology-constructions/${constructionId}/${dendrochronologyId}`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags dendrochronologies
     * @name DendrochronologyConstructionsDelete
     * @summary Удалить строку из заявки
     * @request DELETE:/dendrochronology-constructions/{construction_id}/{dendrochronology_id}
     * @secure
     */
    dendrochronologyConstructionsDelete: (
      constructionId: number,
      dendrochronologyId: number,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDendrochronologyListJSON, Record<string, string>>({
        path: `/dendrochronology-constructions/${constructionId}/${dendrochronologyId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Возвращает token и пользователя; устанавливает cookie auth_token.
     *
     * @tags users
     * @name SigninCreate
     * @summary Вход в систему
     * @request POST:/users/signin
     */
    signinCreate: (body: SerializerUserJSON, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/users/signin`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Требует Authorization: Bearer или cookie auth_token.
     *
     * @tags users
     * @name SignoutCreate
     * @summary Выход
     * @request POST:/users/signout
     * @secure
     */
    signoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/signout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Создание учётной записи (без авторизации).
     *
     * @tags users
     * @name SignupCreate
     * @summary Регистрация пользователя
     * @request POST:/users/signup
     */
    signupCreate: (body: SerializerUserJSON, params: RequestParams = {}) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/signup`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
