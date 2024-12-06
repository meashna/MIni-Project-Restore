
import React from 'react';
import ProjectItem from '../ProjectItem/ProjectItem';
import styles from './ProjectList.module.css';


const ProjectList = ({ projects, refreshProjects, auth })=> {
  return (
    <div className={styles.container}>
      {projects.length === 0 ? (
        <p className={styles.noProjects}>No projects found. Create one!</p>
      ) : (
        <ul className={styles.projectList}>
          {projects.map((project) => (
            <ProjectItem
              key={project._id}
              project={project}
              auth={auth}
              refreshProjects={refreshProjects}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectList;
