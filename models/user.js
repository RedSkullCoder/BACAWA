const db = require('../config/config');
const crypto = require('crypto');

const User = {};

User.getAll = () => {
    const sql = `
    SELECT 
        *
    FROM
        users
    `;

    return db.manyOrNone(sql);
}

User.findById = (id, callback) => {

    const sql = `
    SELECT
        id,
        email,
        name,
        lastname,
        image,
        phone,
        password,
        session_token
    FROM
        users
    WHERE
        id = $1`;
    
    return db.oneOrNone(sql, id).then(user => { callback(null, user); })

}

User.findByUserId = (id) => {
    const sql = `
    SELECT
        U.id,
        U.email,
        U.name,
        U.lastname,
        U.image,
        U.phone,
        U.password,
        U.session_token,
        U.notification_token,
        json_agg(
            json_build_object(
                'id', R.id,
                'name', R.name,
                'image', R.image,
                'route', R.route
            )
        ) AS roles
    FROM 
        users AS U
    INNER JOIN
        user_has_roles AS UHR
    ON
        UHR.id_user = U.id
    INNER JOIN
        roles AS R
    ON
        R.id = UHR.id_rol
    WHERE
        U.id = $1
    GROUP BY
        U.id
    `
    return db.oneOrNone(sql, id);
}

User.findDeliveryMen = () => {
    const sql = `
    SELECT
        U.id,
        U.email,
        U.name,
        U.lastname,
        U.image,
        U.phone,
        U.password,
        U.session_token,
        U.notification_token
    FROM
        users AS U
    INNER JOIN
        user_has_roles AS UHR
    ON 
        UHR.id_user = U.id
    INNER JOIN
        roles AS R
    ON
        R.id = UHR.id_rol
    WHERE
        R.id = 3  
    `;
    return db.manyOrNone(sql);
}

User.findByEmail = (email) => {
    const sql = `
    SELECT
        U.id,
        U.email,
        U.name,
        U.lastname,
        U.image,
        U.phone,
        U.password,
        U.session_token,
        json_agg(
            json_build_object(
                'id', R.id,
                'name', R.name,
                'image', R.image,
                'route', R.route
            )
        ) AS roles
    FROM 
        users AS U
    INNER JOIN
        user_has_roles AS UHR
    ON
        UHR.id_user = U.id
    INNER JOIN
        roles AS R
    ON
        R.id = UHR.id_rol
    WHERE
        U.email = $1
    GROUP BY
        U.id
    `
    return db.oneOrNone(sql, email);
}

User.getAdminsNotificationTokens = () => {
    const sql = `
    SELECT
        U.notification_token
    FROM 
        users AS U
    INNER JOIN
        user_has_roles AS UHR
    ON
        UHR.id_user = U.id
    INNER JOIN
        roles AS R
    ON
        R.id = UHR.id_rol
    WHERE
        R.id = 2
    `
    return db.manyOrNone(sql);
}

User.getUserNotificationToken = (id) => {
    const sql = `
    SELECT
        U.notification_token
    FROM 
        users AS U
    WHERE
        U.id = $1
    `
    return db.oneOrNone(sql, id);
}

User.create = (user) => {

    const myPasswordHashed = crypto.createHash('md5').update(user.password).digest('hex');
    user.password = myPasswordHashed;

    const sql = `
    INSERT INTO
        users(
            email,
            name,
            lastname,
            phone,
            image,
            password,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `;

    return db.oneOrNone(sql, [
        user.email,
        user.name,
        user.lastname,
        user.phone,
        user.image,
        user.password,
        new Date(),
        new Date()
    ]);
}

User.createBack = (user) => {

    const myPasswordHashed = crypto.createHash('md5').update(user.password).digest('hex');
    user.password = myPasswordHashed;

    const sql = `
    INSERT INTO
        users(
            email,
            name,
            lastname,
            phone,
            password,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    return db.oneOrNone(sql, [
        user.email,
        user.name,
        user.lastname,
        user.phone,
        user.password,
        new Date(),
        new Date()
    ]);
}

User.update = (user) => {
    const sql = `
    UPDATE
        users
    SET
        name = $2,
        lastname = $3,
        phone = $4,
        image = $5,
        updated_at = $6
    WHERE
        id = $1
    `;

    return db.none(sql, [
        user.id,
        user.name,
        user.lastname,
        user.phone,
        user.image,
        new Date()
    ]);
}

User.updateToken = (id, token) => {
    const sql = `
    UPDATE
        users
    SET
        session_token = $2
    WHERE
        id = $1
    `;

    return db.none(sql, [
        id,
        token
    ]);
}

User.updateNotificationToken = (id, token) => {
    const sql = `
    UPDATE
        users
    SET
        notification_token = $2
    WHERE
        id = $1
    `;

    return db.none(sql, [
        id,
        token
    ]);
}

User.isPasswordMatched = (userPassword, hash) => {
    const myPasswordHashed = crypto.createHash('md5').update(userPassword).digest('hex');
    if (myPasswordHashed === hash) {
        return true;
    }
    return false;
}


User.deleteUser = (id) => {
    const sql = `DELETE FROM users WHERE id  = $1`;
    const vali = [id];
//id  = ${id};
    return db.manyOrNone(sql,vali,id);
}

User.updateUserData = (id, email, name, lastname , phone) => {
    const sql = `
    UPDATE
        users
    SET                                           
        email = $2,
	name = $3,
	lastname = $4,
	phone = $5
    WHERE                           
        id = $1     
    `;
                 
    return db.none(sql, [
	    id,
	    email,
	    name,
	    lastname,
	    phone
    ]);                    
}      


User.findByRole = (id) => {
    const sql = `
    SELECT
    
    id_rol
    
    FROM 
        user_has_roles 
	WHERE id_user = $1 
    
    `
    return db.oneOrNone(sql, id);
}

User.findByName = () => {
    const sql = `
    SELECT
    cars.id, 
    name,
    lastname,
    cars.marca,
    cars.modelo,
    cars.year,
    cars.placa,
    cars.created_at,
    cars.color

    FROM
    cars
	LEFT JOIN users ON
     users.id = cars.id_user 
    
    `

    return db.manyOrNone(sql);
}



User.updateUserIdRol = (id_user, id_rol) => {
    const sql = `
    UPDATE
        user_has_roles
    SET                                           
        id_rol = $2
    WHERE                           
        id_user = $1     
    `;
                 
    return db.none(sql, [
	    id_user,
	    id_rol,
    ]);                    
} 

User.addressAll = () => {
    const sql = `
   
   SELECT
    address.id, 
    name,
    lastname,
    address.address,
    address.lat,
    address.lng,
    address.created_at
    

    FROM
    address
	LEFT JOIN users ON
     users.id = address.id_user


    `

    return db.manyOrNone(sql);
}

User.clientAll = () => {
    const sql = `
   
SELECT 
    user_has_roles.id_user, 
    user_has_roles.id_rol,
email,
name,
    lastname,
    phone
    

    FROM
    user_has_roles
	LEFT JOIN users ON
      users.id = user_has_roles.id_user and user_has_roles.id_rol = 1  
      WHERE user_has_roles.id_rol < 2

    `

    return db.manyOrNone(sql);
}


User.hasRoles = (id) => {
    const sql = `
    
   SELECT
    user_has_roles.id_user, 
    users.name,
    lastname,
    user_has_roles.id_rol
   FROM
    user_has_roles
        LEFT JOIN users ON
    
     users.id = user_has_roles.id_user 
      WHERE  user_has_roles.id_rol = $1  
    
  
	`
	return db.manyOrNone(sql,id);
//    return db.oneOrNone(sql, id);
}


module.exports = User;
