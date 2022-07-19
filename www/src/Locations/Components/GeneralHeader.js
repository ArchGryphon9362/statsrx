import './GeneralHeader.css'

export const GeneralHeader = () => {
    return (
        <div id='general-header'>
            <div id='back-button' className='hidden'><p>Back</p></div>
            <h1 id='title' className='header-title'>Latest Stats</h1>
        </div>
    )
}