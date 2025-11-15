export const getObjectPropertyDefault = (property: objectProperty): any => {
    if (property.type === 'object')
        return {
            [ property.key ]: property.structure.reduce<any>((acc, p) => {
                acc[ p.key ] = getObjectPropertyDefault(p)[ p.key ];
                return acc;
            }, {})
        };

    if (property.type === 'array')
        return {
            [ property.key ]: [
                getObjectPropertyDefault(property.structure)[ property.structure.key ]
            ]
        };

    return {
        [ property.key ]: property.default
    };
};