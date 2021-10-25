import type { FC } from "react";
import {
    BrowserRouter,
    Switch,
    Route,
    Redirect,
    RouteProps,
} from "react-router-dom";
import { createState, useState, State } from "@hookstate/core";
import { GoogleAuth, Home, FilterType, ItemProps } from "./components";

export type ServiceType = {
    name: string;
    status: string;
};
export interface AppState {
    services: ServiceType[];
    filtering: boolean;
    configuring: boolean;
    integrating: boolean;
}

interface FeatureType {
    filter: FilterType;
    direction?: SortOrder;
}
export interface FeatureState {
    results: ItemProps[];
    features: FeatureType[];
}
export const FILTERS = [
    "url",
    "words.title",
    "words.author",
    "words.date",
    "words.length",
];
export const featureState = createState<FeatureState>({
    results: [],
    features: FILTERS.map((name) => ({ filter: { name } })),
});
export const metaState = createState<AppState>({
    services: [],
    filtering: false,
    configuring: false,
    integrating: false,
});
type AuthState = {
    token?: string;
};
const authState = createState<AuthState>({});

export const useAuth = (): State<AuthState> => useState<AuthState>(authState);

const App: FC = () => {
    return (
        <BrowserRouter>
            <Switch>
                <PrivateRoute exact path="/" component={Home} />
                <Route path="/login" component={GoogleAuth} />
            </Switch>
        </BrowserRouter>
    );
};

const PrivateRoute: FC<RouteProps> = (props: RouteProps) => {
    const auth = useAuth();
    if (auth.token.get()) return <Route {...props} />;
    return <Redirect to="/login" />;
};

export default App;
