/**
 * 한국 시간(UTC+9) 관련 유틸리티 함수들
 * 모든 시간 처리를 한국 시간으로 통일하기 위한 헬퍼 함수들
 */

/**
 * 현재 한국 시간을 반환합니다
 * @returns 한국 시간 Date 객체
 */
export const getKoreanTime = (): Date => {
    const now = new Date();
    // UTC 시간에 9시간을 더해서 한국 시간으로 변환
    const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreanTime;
};

/**
 * 주어진 날짜를 한국 시간으로 변환합니다
 * @param date 변환할 날짜
 * @returns 한국 시간 Date 객체
 */
export const toKoreanTime = (date: Date | string): Date => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    // UTC 시간에 9시간을 더해서 한국 시간으로 변환
    return new Date(inputDate.getTime() + (9 * 60 * 60 * 1000));
};

/**
 * 한국 시간을 ISO 문자열로 반환합니다 (API 전송용)
 * @param date 변환할 날짜 (없으면 현재 시간)
 * @returns ISO 문자열
 */
export const toKoreanISOString = (date?: Date | string): string => {
    const inputDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.toISOString();
};

/**
 * 한국 시간을 로케일 문자열로 반환합니다 (화면 표시용)
 * @param date 변환할 날짜
 * @param options 로케일 옵션
 * @returns 한국어 형식의 날짜 문자열
 */
export const toKoreanLocaleString = (
    date: Date | string, 
    options?: Intl.DateTimeFormatOptions
): string => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.toLocaleString('ko-KR', options);
};

/**
 * 한국 시간을 날짜만 로케일 문자열로 반환합니다 (화면 표시용)
 * @param date 변환할 날짜
 * @param options 로케일 옵션
 * @returns 한국어 형식의 날짜 문자열
 */
export const toKoreanLocaleDateString = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
): string => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.toLocaleDateString('ko-KR', options);
};

/**
 * 한국 시간을 시간만 로케일 문자열로 반환합니다 (화면 표시용)
 * @param date 변환할 날짜
 * @param options 로케일 옵션
 * @returns 한국어 형식의 시간 문자열
 */
export const toKoreanLocaleTimeString = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
): string => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.toLocaleTimeString('ko-KR', options);
};

/**
 * 한국 시간으로 날짜를 설정합니다 (특정 시간으로)
 * @param date 기준 날짜
 * @param hours 시간 (0-23)
 * @param minutes 분 (0-59)
 * @param seconds 초 (0-59)
 * @param milliseconds 밀리초 (0-999)
 * @returns 설정된 한국 시간 Date 객체
 */
export const setKoreanTime = (
    date: Date | string,
    hours: number,
    minutes: number = 0,
    seconds: number = 0,
    milliseconds: number = 0
): Date => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const koreanTime = toKoreanTime(inputDate);
    koreanTime.setHours(hours, minutes, seconds, milliseconds);
    return koreanTime;
};

/**
 * 한국 시간으로 날짜 문자열을 생성합니다 (YYYY-MM-DD 형식)
 * @param date 변환할 날짜
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export const toKoreanDateString = (date?: Date | string): string => {
    const inputDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.toISOString().split('T')[0];
};

/**
 * 한국 시간으로 시간 문자열을 생성합니다 (HH:MM 형식)
 * @param date 변환할 날짜
 * @returns HH:MM 형식의 시간 문자열
 */
export const toKoreanTimeString = (date?: Date | string): string => {
    const inputDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.toTimeString().split(' ')[0].substring(0, 5);
};

/**
 * 한국 시간 기준으로 날짜 비교를 위한 타임스탬프를 반환합니다
 * @param date 비교할 날짜
 * @returns 한국 시간 기준 타임스탬프
 */
export const getKoreanTimestamp = (date: Date | string): number => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const koreanTime = toKoreanTime(inputDate);
    return koreanTime.getTime();
};

/**
 * 한국 시간 기준으로 오늘 날짜인지 확인합니다
 * @param date 확인할 날짜
 * @returns 오늘 날짜인지 여부
 */
export const isKoreanToday = (date: Date | string): boolean => {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const koreanTime = toKoreanTime(inputDate);
    const today = getKoreanTime();
    
    return koreanTime.toDateString() === today.toDateString();
};

/**
 * 한국 시간 기준으로 날짜 차이를 계산합니다 (밀리초)
 * @param date1 첫 번째 날짜
 * @param date2 두 번째 날짜
 * @returns 날짜 차이 (밀리초)
 */
export const getKoreanTimeDifference = (date1: Date | string, date2: Date | string): number => {
    const koreanTime1 = toKoreanTime(date1);
    const koreanTime2 = toKoreanTime(date2);
    return koreanTime1.getTime() - koreanTime2.getTime();
};
