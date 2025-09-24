// src/utils/excelDownload.js
import instance from '@/api/axios';
import { showSuccess, showError } from '@/utils/alert';

/**
 * 엑셀 파일 다운로드 공통 함수
 * @param {string} url - 다운로드할 API 엔드포인트 URL
 * @param {string} defaultFilename - 기본 파일명 (옵션, 기본값: 'download.xlsx')
 * @param {Object} options - 추가 옵션
 * @param {Object} options.headers - 추가 헤더 (옵션)
 * @param {Object} options.params - URL 파라미터 (옵션)
 * @returns {Promise<Object>} 다운로드 결과 { success: boolean, message: string }
 */
export async function downloadExcel(url, defaultFilename = 'download.xlsx', options = {}) {
  try {
    const response = await instance.get(url, {
      responseType: 'blob', // 파일 다운로드를 위해 blob 타입으로 설정
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ...options.headers
      },
      params: options.params
    });

    // 파일명 추출 (Content-Disposition 헤더에서)
    const contentDisposition = response.headers['content-disposition'];
    let filename = defaultFilename;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        // UTF-8 인코딩된 파일명 처리
        if (filename.startsWith('UTF-8\'\'')) {
          filename = decodeURIComponent(filename.substring(7));
        }
      }
    }

    // Blob을 이용해 파일 다운로드
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { 
      success: true, 
      message: '파일 다운로드가 완료되었습니다.',
      filename: filename 
    };
    
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    
    // 에러 메시지 처리
    let errorMessage = '파일 다운로드 중 오류가 발생했습니다.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = '요청한 파일을 찾을 수 없습니다.';
      } else if (error.response.status === 403) {
        errorMessage = '파일 다운로드 권한이 없습니다.';
      } else if (error.response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
    } else if (error.request) {
      errorMessage = '네트워크 연결을 확인해주세요.';
    }
    
    throw {
      ...error,
      message: errorMessage
    };
  }
}

/**
 * CSV 파일 다운로드 공통 함수
 * @param {string} url - 다운로드할 API 엔드포인트 URL
 * @param {string} defaultFilename - 기본 파일명 (옵션, 기본값: 'download.csv')
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} 다운로드 결과
 */
export async function downloadCsv(url, defaultFilename = 'download.csv', options = {}) {
  try {
    const response = await instance.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv',
        ...options.headers
      },
      params: options.params
    });

    // 파일명 추출
    const contentDisposition = response.headers['content-disposition'];
    let filename = defaultFilename;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        if (filename.startsWith('UTF-8\'\'')) {
          filename = decodeURIComponent(filename.substring(7));
        }
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { 
      success: true, 
      message: '파일 다운로드가 완료되었습니다.',
      filename: filename 
    };
    
  } catch (error) {
    console.error('CSV 다운로드 오류:', error);
    throw error;
  }
}

/**
 * 엑셀 파일 업로드 범용 함수
 * @param {string} url - 업로드할 API 엔드포인트 URL
 * @param {File} file - 업로드할 엑셀 파일
 * @param {Object} options - 추가 옵션
 * @param {Object} options.additionalData - 함께 전송할 추가 데이터 (FormData에 추가)
 * @param {Object} options.headers - 추가 헤더
 * @param {Function} options.onProgress - 업로드 진행률 콜백 함수
 * @param {Array} options.allowedExtensions - 허용할 파일 확장자 배열 (기본: ['.xlsx', '.xls'])
 * @param {number} options.maxSize - 최대 파일 크기 (바이트, 기본: 10MB)
 * @returns {Promise} 업로드 결과
 */
export async function uploadExcel(url, file, options = {}) {
  try {
    // 기본 옵션 설정
    const defaultOptions = {
      allowedExtensions: ['.xlsx', '.xls', '.csv'],
      maxSize: 10 * 1024 * 1024, // 10MB
      additionalData: {},
      headers: {},
      onProgress: null
    };
    
    const config = { ...defaultOptions, ...options };

    // 파일 유효성 검증
    if (!file) {
      throw new Error('업로드할 파일을 선택해주세요.');
    }

    // 파일 확장자 검증
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!config.allowedExtensions.includes(fileExtension)) {
      throw new Error(`허용되지 않는 파일 형식입니다. 허용 형식: ${config.allowedExtensions.join(', ')}`);
    }

    // 파일 크기 검증
    if (file.size > config.maxSize) {
      const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
      throw new Error(`파일 크기가 너무 큽니다. 최대 크기: ${maxSizeMB}MB`);
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);

    // 추가 데이터가 있으면 FormData에 추가
    if (config.additionalData) {
      Object.keys(config.additionalData).forEach(key => {
        const value = config.additionalData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
    }

    // 요청 설정
    const requestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    };

    // 진행률 콜백이 있으면 추가
    if (config.onProgress && typeof config.onProgress === 'function') {
      requestConfig.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        config.onProgress(percentCompleted, progressEvent);
      };
    }

    // 업로드 실행
    const response = await instance.post(url, formData, requestConfig);

    // 업로드 결과에 따라 알림 표시
    if (response.data.code == 400) {
      return {
        status: 'fail',
        data: response.data,
        message: response.data?.message || '파일 업로드에 실패했습니다.',
        filename: file.name
      };
    } else {
      return {
        status: 'success',
        data: response.data,
        message: response.data?.message || '파일 업로드가 완료되었습니다.',
        filename: file.name
      };
    }

  } catch (error) {
    console.error('엑셀 업로드 오류:', error);
    
    // 에러 메시지 처리
    let errorMessage = '파일 업로드 중 오류가 발생했습니다.';
    
    if (error.message) {
      // 클라이언트 측 유효성 검증 에러
      errorMessage = error.message;
    } else if (error.response) {
      // 서버 응답 에러
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 400) {
        errorMessage = '잘못된 파일 형식이거나 파일이 손상되었습니다.';
      } else if (error.response.status === 401) {
        errorMessage = '로그인이 필요합니다.';
      } else if (error.response.status === 403) {
        errorMessage = '파일 업로드 권한이 없습니다.';
      } else if (error.response.status === 413) {
        errorMessage = '파일 크기가 너무 큽니다.';
      } else if (error.response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
    } else if (error.request) {
      errorMessage = '네트워크 연결을 확인해주세요.';
    }
    
    // 에러 알림 표시
    showError('업로드 실패', errorMessage);
    
    throw {
      ...error,
      success: false,
      message: errorMessage,
      filename: file?.name
    };
  }
}

