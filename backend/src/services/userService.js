/**
 * User Service
 * 사용자 관련 비즈니스 로직 처리
 */
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { BadRequestError, AuthenticationError, NotFoundError } = require('../utils/errorHandler');

/**
 * 사용자 생성
 */
const createUser = async (userData) => {
  try {
    // 사용자명 중복 확인
    const [existingUsernames] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE username = $1',
      [userData.username]
    );
    
    if (existingUsernames[0].count > 0) {
      throw new BadRequestError('이미 사용 중인 사용자명입니다.');
    }
    
    // 이메일 중복 확인
    const [existingEmails] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE email = $1',
      [userData.email]
    );
    
    if (existingEmails[0].count > 0) {
      throw new BadRequestError('이미 사용 중인 이메일입니다.');
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 사용자 생성
    const [result] = await db.execute(
      `INSERT INTO users (
        username, email, password, first_name, last_name, role, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role, status`,
      [
        userData.username,
        userData.email,
        hashedPassword,
        userData.firstName || null,
        userData.lastName || null,
        userData.role || 'user',
        'active'
      ]
    );
    
    return result[0];
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new Error(`사용자 생성 중 오류 발생: ${error.message}`);
  }
};

/**
 * 사용자 인증
 */
const authenticateUser = async (username, password) => {
  try {
    // 사용자 조회
    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    const user = users[0];
    
    if (!user) {
      throw new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    
    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    
    return user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(`사용자 인증 중 오류 발생: ${error.message}`);
  }
};

/**
 * 모든 사용자 조회
 */
const getAllUsers = async () => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at FROM users ORDER BY id'
    );
    
    return users;
  } catch (error) {
    throw new Error(`사용자 목록 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * ID로 사용자 조회
 */
const getUserById = async (userId) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0];
  } catch (error) {
    throw new Error(`사용자 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 사용자 정보 업데이트
 */
const updateUser = async (userId, updateData) => {
  try {
    // 사용자 존재 확인
    const user = await getUserById(userId);
    
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }
    
    // 사용자명 변경 시 중복 확인
    if (updateData.username && updateData.username !== user.username) {
      const [existingUsernames] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE username = $1 AND id != $2',
        [updateData.username, userId]
      );
      
      if (existingUsernames[0].count > 0) {
        throw new BadRequestError('이미 사용 중인 사용자명입니다.');
      }
    }
    
    // 이메일 변경 시 중복 확인
    if (updateData.email && updateData.email !== user.email) {
      const [existingEmails] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE email = $1 AND id != $2',
        [updateData.email, userId]
      );
      
      if (existingEmails[0].count > 0) {
        throw new BadRequestError('이미 사용 중인 이메일입니다.');
      }
    }
    
    // 업데이트할 필드 구성
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updateData)) {
      // 컬럼명 변환 (camelCase -> snake_case)
      let columnName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      updateFields.push(`${columnName} = $${paramIndex}`);
      updateValues.push(value);
      paramIndex++;
    }
    
    if (updateFields.length === 0) {
      return user; // 업데이트할 내용이 없으면 기존 사용자 반환
    }
    
    // 업데이트 쿼리 실행
    updateValues.push(userId);
    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, username, email, first_name, last_name, role, status
    `;
    
    const [result] = await db.execute(query, updateValues);
    
    return result[0];
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`사용자 업데이트 중 오류 발생: ${error.message}`);
  }
};

/**
 * 비밀번호 변경
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // 사용자 조회
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (users.length === 0) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }
    
    const user = users[0];
    
    // 현재 비밀번호 검증
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new BadRequestError('현재 비밀번호가 올바르지 않습니다.');
    }
    
    // 새 비밀번호 해싱
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // 비밀번호 업데이트
    await db.execute(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, userId]
    );
    
    return true;
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`비밀번호 변경 중 오류 발생: ${error.message}`);
  }
};

/**
 * 사용자 삭제
 */
const deleteUser = async (userId) => {
  try {
    // 사용자 존재 확인
    const user = await getUserById(userId);
    
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }
    
    // 사용자 삭제
    await db.execute(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`사용자 삭제 중 오류 발생: ${error.message}`);
  }
};

module.exports = {
  createUser,
  authenticateUser,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser
};
