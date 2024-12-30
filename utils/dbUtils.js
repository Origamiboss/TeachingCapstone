const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Create a MySQL connection
const con = mysql.createConnection({
    host: '192.168.1.153',
    user: 'capstoneUser',
    password: 'Zv935YOiwUVv',
    database: 'capstone'
});

const dbUtils = {
    login: (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT username, role, password FROM profile WHERE username = ?';

            con.query(sql, [username], (err, result) => {
                if (err) {
                    console.error("Error retrieving user from database:", err);
                    return reject("Error retrieving user from database");
                }

                if (result.length === 0) {
                    return reject("Invalid Username or Password");
                }

                const user = result[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error("Error comparing password:", err);
                        return reject("Error comparing password");
                    }

                    if (!isMatch) {
                        return reject("Invalid Username or Password");
                    }

                    return resolve({ username: user.username, role: user.role });
                });
            });
        });
    },

    createAccount: (username, password, role) => {
        return new Promise((resolve, reject) => {
            const saltRounds = 10;

            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    return reject('Error hashing password');
                }

                const sql = `INSERT INTO profile (username, password, role) VALUES (?, ?, ?)`;
                con.query(sql, [username, hashedPassword, role], (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return reject('Username already exists');
                        } else {
                            console.error("Error saving to database:", err);
                            return reject('Error saving to database');
                        }
                    }

                    return resolve({ username: username, role: role });
                });
            });
        });
    },

    findClasses: (username, role) => {
        return new Promise((resolve, reject) => {
            let sql;

            if (role === "student") {
                sql = 'SELECT class.name FROM class, profileClass, profile WHERE profile.username = ? AND profileClass.profileName = profile.username AND class.id = profileClass.classId';
            } else if (role === "teacher") {
                sql = 'SELECT DISTINCT class.name FROM class JOIN profile ON class.teacherName = profile.username WHERE profile.username = ?';
            } else {
                return reject("Invalid role");
            }

            con.query(sql, [username], (err, result) => {
                if (err) {
                    console.error("Error retrieving classes from database:", err);
                    return reject('Error retrieving classes from database');
                }

                if (result.length === 0) {
                    return reject('No Classes Found');
                }

                const classNames = result.map(row => row.name); // Extract class names
                return resolve({ status: 'success', classes: classNames });
            });
        });
    },

    addClassConnection: (username, classId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT class.name FROM class WHERE class.id = ?';
            con.query(sql, [classId], (err, result) => {
                if (err) {
                    console.error("Error searching database:", err);
                    return reject('Error searching database');
                }

                if (result.length === 0) {
                    return reject('Invalid Class');
                }

                const insertTableSql = 'INSERT INTO profileClass (profileName, classId) VALUES (?, ?)';
                con.query(insertTableSql, [username, classId], (err, result) => {
                    if (err) {
                        console.error("Error inserting class connection:", err);
                        return reject('Invalid ID');
                    }

                    return resolve({ status: 'success', message: 'Connection made successfully!' });
                });
            });
        });
    },

    addClass: (username, classId, className) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO class (id, name, teacherName) VALUES (?, ?, ?)`;
            con.query(sql, [classId, className, username], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return reject('Class ID already exists');
                    } else {
                        console.error("Error saving to database:", err);
                        return reject('Error saving to database');
                    }
                }

                return resolve({ status: 'success', message: 'Class added successfully!' });
            });
        });
    },
    findAssignments: (className, username) => {
        return new Promise((resolve, reject) => {
            var sql = 'SELECT DISTINCT *, DATE_FORMAT(dueDate, "%Y-%m-%d") AS formatted_date FROM assignment WHERE className = ?';

            con.query(sql, [className], (err, result) => {
                if (err) {
                    console.error("Error retrieving Assignments from database:", err);
                    return reject('Error retrieving Assignments from database');
                }

                if (result.length === 0) {
                    return reject('No Assignments Found');
                }

                const assignmentsPromises = result.map((row) => {
                    return new Promise((resolveAssignment) => {
                        const assignment = {
                            name: row.name,
                            id: row.id,
                            dueDate: row.formatted_date,
                            className: row.className,
                            grade: null // Initialize with no grade
                        };

                        const gradeSQL = 'SELECT grade FROM grade WHERE grade.assignId = ? AND grade.profileName = ?';
                        con.query(gradeSQL, [row.id, username], (err, gradeResult) => {
                            if (err) {
                                console.error("Error retrieving grades from database:", err);
                                return resolveAssignment(assignment);
                            }

                            if (gradeResult.length > 0) {
                                // If a grade is found, add it to the assignment
                                assignment.grade = gradeResult[0].grade;
                            }

                            resolveAssignment(assignment);
                        });
                    });
                });
                //do all the assignments
                Promise.all(assignmentsPromises)
                    .then((assignments) => {
                        return resolve({ status: 'success', assignments: assignments });
                    })
                    .catch((err) => {
                        console.error("Error processing assignments:", err);
                        return reject('Error processing assignments');
                    });
            });
        });
    },
    findQuestions: async (id) => {
        try {
            // Query to get questions
            const sql = 'SELECT * FROM question WHERE assignId = ?';
            const [questions] = await con.promise().query(sql, [id]);

            if (questions.length === 0) {
                throw new Error('No questions found');
            }

            const questionsData = questions.map(row => ({
                num: row.num,
                prompt: row.prompt,
                assignId: row.assignId,
                correctAnswer: row.correctAnswer
            }));

            // Query to get answers
            const answerSql = 'SELECT * FROM answer WHERE assignId = ?';
            const [answers] = await con.promise().query(answerSql, [id]);

            if (answers.length === 0) {
                throw new Error('No answers found');
            }

            const answersData = answers.map(row => ({
                prompt: row.prompt,
                num: row.num,
                assignId: row.assignId
            }));

            // Return data as a resolved promise
            return { status: 'success', questions: questionsData, answers: answersData };
        } catch (err) {
            // Log the error but do not throw it to kill the server
            console.error("Error retrieving questions/answers:", err);
            return { status: 'error', message: 'Error retrieving questions or answers' };  // Send a meaningful response
        }
    },
    submitAnswers: async (answers, username, assignId) => {
        try {
            // Get the questions for the given assignment ID
            const sql = 'SELECT * FROM question WHERE assignId = ?';
            const [questions] = await con.promise().query(sql, [assignId]);

            if (questions.length === 0) {
                throw new Error('No questions found');
            }

            // Save the correct answers
            const correctAnswers = questions.map(row => ({
                questionNum: row.num,
                answer: row.correctAnswer
            }));

            // Compare the answers and calculate the grade
            let score = 0;

            // Iterate over the Map directly
            for (let [questionNum, userAnswer] of answers) {
                console.log(`Checking answer for question ${questionNum}: ${userAnswer}`);

                // Find the correct answer for the current question number
                const correctAnswer = correctAnswers.find(q => parseInt(q.questionNum) === parseInt(questionNum))?.answer;
                console.log(parseInt(questionNum));
                console.log(`${userAnswer}`, `${correctAnswer}`);

                // Compare the user's answer with the correct answer
                if (`${userAnswer}` === `${correctAnswer}`) {
                    score++;
                }
            }

            const numOfQuestions = correctAnswers.length;
            const grade = (score / numOfQuestions) * 100;

            // Insert the grade into the database
            const addGradeSql = 'INSERT INTO grade (grade, profileName, assignId) VALUES (?, ?, ?)';
            await con.promise().query(addGradeSql, [grade, username, assignId]);

            // Return the grade and score
            return {
                status: 'success',
                grade: grade,
                score: score,
                totalQuestions: numOfQuestions
            };
        } catch (err) {
            // Log the error but do not throw it to kill the server
            console.error("Error submitting answers:", err);
            return { status: 'error', message: 'Error submitting answers' };  // Send a meaningful response
        }
    }

};

module.exports = dbUtils;
