import './BreadCrumbs.css'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { FC } from 'react'

interface ICrumb {
  label: string
  path?: string
}

interface BreadCrumbsProps {
  crumbs: ICrumb[]
}

export const BreadCrumbs: FC<BreadCrumbsProps> = ({ crumbs }) => {
  return (
    <ul className="breadcrumbs">
      {crumbs.map((crumb, index) => (
        <Fragment key={index}>
          {index > 0 && <li className="slash">/</li>}
          {index === crumbs.length - 1 ? (
            <li>{crumb.label}</li>
          ) : (
            <li>
              <Link to={crumb.path || ''}>{crumb.label}</Link>
            </li> 
          )}
        </Fragment>
      ))}
    </ul>
  )
}
