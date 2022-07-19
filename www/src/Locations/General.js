import '../index.css'
import './General.css'
import { GeneralHeader } from './Components/GeneralHeader'
import { Stats } from './Components/Stats'

export const General = () => {
    return (
        <div id='general'>
            <GeneralHeader />
            <div className='content'>
                <Stats />
            </div>
        </div>
    )
}