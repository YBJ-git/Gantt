/**
 * SQLite Database Configuration
 * 개발 환경용 SQLite 데이터베이스 연결 설정
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logger } = require('../utils/logger');

// SQLite 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../../my_project_db.sqlite');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logger.error('SQLite 데이터베이스 연결 오류:', err.message);
    } else {
        logger.info('SQLite 데이터베이스에 연결되었습니다.');
    }
});

module.exports = {
    // 쿼리 실행 (Promise 기반)
    execute: (query, params = []) => {
        return new Promise((resolve, reject) => {
            // SELECT 쿼리인지 확인
            if (query.trim().toLowerCase().startsWith('select')) {
                db.all(query, params, (err, rows) => {
                    if (err) {
                        logger.error(`데이터베이스 쿼리 오류: ${err.message}`, { query, params });
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                });
            } else {
                // INSERT, UPDATE, DELETE 쿼리
                db.run(query, params, function(err) {
                    if (err) {
                        logger.error(`데이터베이스 쿼리 오류: ${err.message}`, { query, params });
                        reject(err);
                    } else {
                        resolve({ 
                            id: this.lastID, 
                            changes: this.changes 
                        });
                    }
                });
            }
        });
    },

    // 단일 행 조회
    get: (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) {
                    logger.error(`데이터베이스 조회 오류: ${err.message}`, { query, params });
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    },

    // 모든 행 조회
    all: (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    logger.error(`데이터베이스 조회 오류: ${err.message}`, { query, params });
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    },

    // 트랜잭션 시작
    beginTransaction: () => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            execute: (query, params = []) => {
                                return new Promise((res, rej) => {
                                    db.run(query, params, function(err) {
                                        if (err) {
                                            rej(err);
                                        } else {
                                            res({ id: this.lastID, changes: this.changes });
                                        }
                                    });
                                });
                            },
                            commit: () => {
                                return new Promise((res, rej) => {
                                    db.run('COMMIT', (err) => {
                                        if (err) rej(err);
                                        else res();
                                    });
                                });
                            },
                            rollback: () => {
                                return new Promise((res, rej) => {
                                    db.run('ROLLBACK', (err) => {
                                        if (err) rej(err);
                                        else res();
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    },

    // 데이터베이스 연결 종료
    close: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) {
                    logger.error('데이터베이스 연결 종료 오류:', err.message);
                    reject(err);
                } else {
                    logger.info('SQLite 데이터베이스 연결이 종료되었습니다.');
                    resolve();
                }
            });
        });
    },

    // 원본 데이터베이스 객체 (필요시 사용)
    getDb: () => db
};