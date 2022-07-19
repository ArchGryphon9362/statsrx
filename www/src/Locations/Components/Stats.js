import './Stats.css'
import { VictoryPie, VictoryLabel } from 'victory';

export const Stats = () => {
    function getData(percent) {
        return [{x: 1, y: percent}, {x: 2, y: 1-percent}];
    }
    return (
        <div>
            <div class='gauge'>
                <svg viewBox="0 0 400 400" width="100%" height="100%">
                    <VictoryPie
                        standalone={false}
                        startAngle={10}
                        endAngle={350}
                        innerRadius={100}
                        cornerRadius={25}
                        data={getData(0.2)}
                        labels={() => null}
                        width={400} height={400}
                        style={{
                            data: { fill: ({datum}) => {
                                return datum.x === 1 ? "#00212b" : "transparent"
                            }}
                        }}
                    />
                    <VictoryLabel 
                        textAnchor="middle" verticalAnchor="middle"
                        text={'hi'}
                        x={200} y={200}
                        style={{ fontSize: 30 }}
                    />
                </svg>
            </div>
        </div>
    )
}