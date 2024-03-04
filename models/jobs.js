"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a Job (from data), update db, return new Job data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if Job already in database.
   * 
   * jobs (title, salary, equity, company_handle)
   * 
   * */

  static async create({ title, salary, equity, company_handle  }) {
    const duplicateCheck = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = $1, salary=$2, equity=$3, company_handle=$4`,
        [title, salary, equity, company_handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate Job`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          company_handle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all Jobs.
   *
   * Returns [{ title, salary,equity,company_handle,id }, ...]
   * */

  static async findAll() {
    let result = await db.query(`SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle",
                  id
           FROM jobs`);


    return result.rows;
  }

  /** Given an id, return data about jobs.
   *
   * Returns { title, salary, equity, company_handle}
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT company_handle as companyHandle,
                id,
                title,
                salary,
                equity
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Jobs Found`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, company_handle, title, salary, equity}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          company_handle: "companyHandle",

        });
    
    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${id} 
                      RETURNING id, 
                                company_handle as companyHandle, 
                                title, 
                                salary, 
                                equity`;
    const result = await db.query(querySql, [...values]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Jobs Found`);

    return job;
  }

  /** Delete given Job from database; returns undefined.
   *
   * Throws NotFoundError if Job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Job with id: ${id} found`);
  }
}


module.exports = Job;