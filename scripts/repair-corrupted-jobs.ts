import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function repair() {
  console.log('Inspecting and repairing corrupted jobs and enrollments...');

  const { rows: jobs } = await pool.query('SELECT * FROM jobs');
  console.log(`Found ${jobs.length} total jobs in database.`);

  for (const j of jobs) {
    const isCorrupted = !j.title || j.title.trim() === '' || !j.package_id || !j.class_id;
    console.log(`Job ${j.id}: title="${j.title}", status=${j.status}, assigned=${j.assigned_tentor_id}, isCorrupted=${isCorrupted}`);

    if (isCorrupted) {
      // Check if there is an enrollmentId
      let enrollment = null;
      if (j.enrollment_id) {
        const res = await pool.query('SELECT * FROM enrollments WHERE id = $1', [j.enrollment_id]);
        enrollment = res.rows[0];
      }

      // If no enrollment, check if student_id exists
      let student = null;
      if (j.student_id) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [j.student_id]);
        student = res.rows[0];
      }

      // Get first class and subject
      const classesRes = await pool.query('SELECT * FROM classes WHERE deleted_at IS NULL LIMIT 1');
      const subjectsRes = await pool.query('SELECT * FROM subjects WHERE deleted_at IS NULL LIMIT 1');
      const packagesRes = await pool.query('SELECT * FROM packages WHERE deleted_at IS NULL LIMIT 1');

      const classId = j.class_id || (Array.isArray(j.class_ids) && j.class_ids[0]) || enrollment?.class_id || classesRes.rows[0]?.id;
      const subjectId = j.subject_id || (Array.isArray(j.subject_ids) && j.subject_ids[0]) || enrollment?.subject_id || subjectsRes.rows[0]?.id;
      const packageId = j.package_id || enrollment?.package_id || packagesRes.rows[0]?.id;

      const classNameRes = await pool.query('SELECT class_name FROM classes WHERE id = $1', [classId]);
      const subjectNameRes = await pool.query('SELECT name FROM subjects WHERE id = $1', [subjectId]);

      const className = classNameRes.rows[0]?.class_name || 'SD';
      const subjectName = subjectNameRes.rows[0]?.name || 'Matematika';
      const studentName = student?.full_name || 'Budi Santoso';

      const repairedTitle = `Bimbingan ${className} - ${subjectName}`;
      const scheduleDays = (Array.isArray(j.schedule_days) && j.schedule_days.length > 0 && j.schedule_days[0])
        ? j.schedule_days
        : ['MONDAY', 'WEDNESDAY'];

      await pool.query(`
        UPDATE jobs SET
          title = $1,
          class_id = $2,
          class_ids = $3,
          subject_id = $4,
          subject_ids = $5,
          package_id = $6,
          tentor_fee = COALESCE(NULLIF(tentor_fee, 0), 120000),
          schedule_days = $7,
          schedule_time = COALESCE(NULLIF(schedule_time, ''), '16:00'),
          schedule_end_time = COALESCE(NULLIF(schedule_end_time, ''), '17:30'),
          location = COALESCE(NULLIF(location, ''), 'Jl. Margonda Raya No. 100, Depok'),
          student_names = $8
        WHERE id = $9
      `, [
        repairedTitle,
        classId,
        [classId],
        subjectId,
        [subjectId],
        packageId,
        scheduleDays,
        [studentName],
        j.id
      ]);

      console.log(`Repaired job ${j.id} -> title="${repairedTitle}", class=${classId}, subject=${subjectId}`);
    }
  }

  console.log('Repair completed successfully.');
  await pool.end();
}

repair().catch((err) => {
  console.error('Repair error:', err);
  pool.end();
});
