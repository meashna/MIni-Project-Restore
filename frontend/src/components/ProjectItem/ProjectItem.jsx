
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProjectItem.module.css';

const  ProjectItem =({ project, auth, refreshProjects })=> {
  return (
    <li className={styles.projectItem}>
      <Link to={`/projects/${project._id}`} className={styles.projectLink}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDate}>
          Created on: {new Date(project.createdDate).toLocaleDateString()}
        </p>
      </Link>
    </li>
  );
}

export default ProjectItem;
